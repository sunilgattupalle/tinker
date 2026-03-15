import type { BlockInstance, Script, Sprite } from "@/types";
import { getBlockDefinition } from "./registry";
import {
  moveSpriteSteps,
  turnRight,
  turnLeft,
  goTo,
  setX,
  setY,
  setSpriteSize,
  showSprite,
  hideSprite,
} from "@/sprites/engine";
import { useProjectStore } from "@/store/project";
import { useRuntimeStore } from "@/store/runtime";

const MAX_LOOP_ITERATIONS = 10_000;

function waitFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSpriteUpdate(spriteId: string): (updater: (s: Sprite) => Sprite) => void {
  return (updater) => useProjectStore.getState().updateSprite(spriteId, updater);
}

async function executeBlock(
  block: BlockInstance,
  script: Script,
  spriteId: string,
): Promise<void> {
  const runtime = useRuntimeStore.getState();
  if (runtime.stopRequested) return;

  const def = getBlockDefinition(block.definitionId);
  if (!def) return;

  const update = getSpriteUpdate(spriteId);
  const args = block.args;

  switch (block.definitionId) {
    case "motion_move":
      update((s) => moveSpriteSteps(s, Number(args.STEPS ?? 10)));
      break;

    case "motion_turn_right":
      update((s) => turnRight(s, Number(args.DEGREES ?? 15)));
      break;

    case "motion_turn_left":
      update((s) => turnLeft(s, Number(args.DEGREES ?? 15)));
      break;

    case "motion_goto_xy":
      update((s) => goTo(s, Number(args.X ?? 0), Number(args.Y ?? 0)));
      break;

    case "motion_set_x":
      update((s) => setX(s, Number(args.X ?? 0)));
      break;

    case "motion_set_y":
      update((s) => setY(s, Number(args.Y ?? 0)));
      break;

    case "looks_say":
      useRuntimeStore.getState().setSpeechBubble(spriteId, String(args.MESSAGE ?? "Hello!"), null);
      break;

    case "looks_say_for": {
      const seconds = Number(args.SECONDS ?? 2);
      useRuntimeStore.getState().setSpeechBubble(spriteId, String(args.MESSAGE ?? "Hello!"), seconds);
      await waitMs(seconds * 1000);
      break;
    }

    case "looks_show":
      update((s) => showSprite(s));
      break;

    case "looks_hide":
      update((s) => hideSprite(s));
      break;

    case "looks_set_size":
      update((s) => setSpriteSize(s, Number(args.PERCENT ?? 100)));
      break;

    case "control_wait":
      await waitMs(Number(args.SECONDS ?? 1) * 1000);
      break;

    case "control_repeat": {
      const times = Math.min(Number(args.TIMES ?? 10), MAX_LOOP_ITERATIONS);
      for (let i = 0; i < times; i++) {
        if (useRuntimeStore.getState().stopRequested) return;
        await executeBody(block, script, spriteId);
        await waitFrame();
      }
      break;
    }

    case "control_forever": {
      let iterations = 0;
      while (!useRuntimeStore.getState().stopRequested) {
        await executeBody(block, script, spriteId);
        await waitFrame();
        iterations++;
        if (iterations >= MAX_LOOP_ITERATIONS) break;
      }
      break;
    }

    case "control_if": {
      const condition = evaluateCondition(args.CONDITION);
      if (condition) {
        await executeBody(block, script, spriteId);
      }
      break;
    }

    case "control_stop":
      useRuntimeStore.getState().requestStop();
      return;
  }

  await waitFrame();
}

function evaluateCondition(value: string | number | boolean | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true";
  if (typeof value === "number") return value !== 0;
  return true;
}

async function executeBody(
  parentBlock: BlockInstance,
  script: Script,
  spriteId: string,
): Promise<void> {
  const bodyBlockId = parentBlock.branch?.body;
  if (!bodyBlockId) return;

  let currentBlock = script.blocks[bodyBlockId];
  while (currentBlock) {
    if (useRuntimeStore.getState().stopRequested) return;
    await executeBlock(currentBlock, script, spriteId);
    currentBlock = currentBlock.next ? script.blocks[currentBlock.next] : undefined!;
  }
}

async function executeScript(
  script: Script,
  spriteId: string,
): Promise<void> {
  const runtime = useRuntimeStore.getState();
  runtime.addRunningScript(script.id);

  try {
    let currentBlock: BlockInstance | undefined = script.blocks[script.hatBlockId];
    if (currentBlock) {
      currentBlock = currentBlock.next ? script.blocks[currentBlock.next] : undefined;
    }

    while (currentBlock) {
      if (useRuntimeStore.getState().stopRequested) break;
      await executeBlock(currentBlock, script, spriteId);
      currentBlock = currentBlock.next ? script.blocks[currentBlock.next] : undefined;
    }
  } finally {
    useRuntimeStore.getState().removeRunningScript(script.id);
  }
}

export function runGreenFlag(): void {
  const project = useProjectStore.getState().project;
  const runtime = useRuntimeStore.getState();
  runtime.startRunning();

  for (const sprite of project.sprites) {
    for (const script of sprite.scripts) {
      const hatBlock = script.blocks[script.hatBlockId];
      if (hatBlock?.definitionId === "events_flag") {
        executeScript(script, sprite.id);
      }
    }
  }
}

export function runKeyPressScripts(key: string): void {
  const project = useProjectStore.getState().project;

  const keyMap: Record<string, string> = {
    " ": "space",
    ArrowUp: "up arrow",
    ArrowDown: "down arrow",
    ArrowLeft: "left arrow",
    ArrowRight: "right arrow",
  };
  const mappedKey = keyMap[key] ?? key.toLowerCase();

  for (const sprite of project.sprites) {
    for (const script of sprite.scripts) {
      const hatBlock = script.blocks[script.hatBlockId];
      if (
        hatBlock?.definitionId === "events_key" &&
        String(hatBlock.args.KEY) === mappedKey
      ) {
        if (!useRuntimeStore.getState().isRunning) {
          useRuntimeStore.getState().startRunning();
        }
        executeScript(script, sprite.id);
      }
    }
  }
}

export function runSpriteClickScripts(spriteId: string): void {
  const project = useProjectStore.getState().project;
  const sprite = project.sprites.find((s) => s.id === spriteId);
  if (!sprite) return;

  for (const script of sprite.scripts) {
    const hatBlock = script.blocks[script.hatBlockId];
    if (hatBlock?.definitionId === "events_sprite_clicked") {
      if (!useRuntimeStore.getState().isRunning) {
        useRuntimeStore.getState().startRunning();
      }
      executeScript(script, sprite.id);
    }
  }
}

export function stopAll(): void {
  useRuntimeStore.getState().stopRunning();
}
