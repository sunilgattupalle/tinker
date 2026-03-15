import { describe, it, expect, beforeEach, vi } from "vitest";
import { useProjectStore, generateId } from "@/store/project";
import { useRuntimeStore } from "@/store/runtime";
import { runGreenFlag, stopAll } from "./interpreter";
import type { BlockInstance } from "@/types";

function makeBlock(defId: string, args: Record<string, string | number | boolean> = {}, overrides: Partial<BlockInstance> = {}): BlockInstance {
  return {
    id: generateId(),
    definitionId: defId,
    args,
    next: null,
    parent: null,
    ...overrides,
  };
}

describe("Block Interpreter", () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
    useRuntimeStore.setState({
      isRunning: false,
      runningScripts: new Set(),
      speechBubbles: new Map(),
      pressedKeys: new Set(),
      stopRequested: false,
    });
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it("executes motion_move via green flag", async () => {
    const hat = makeBlock("events_flag");
    useProjectStore.getState().addScript(hat);

    const sprite = useProjectStore.getState().getActiveSprite()!;
    const scriptId = sprite.scripts[0].id;

    const move = makeBlock("motion_move", { STEPS: 50 });
    useProjectStore.getState().addBlock(move, scriptId, hat.id);

    runGreenFlag();

    await vi.advanceTimersByTimeAsync(200);

    const updated = useProjectStore.getState().getActiveSprite()!;
    expect(updated.x).toBeCloseTo(50);
  });

  it("executes looks_hide to hide sprite", async () => {
    const hat = makeBlock("events_flag");
    useProjectStore.getState().addScript(hat);

    const sprite = useProjectStore.getState().getActiveSprite()!;
    const scriptId = sprite.scripts[0].id;

    const hide = makeBlock("looks_hide");
    useProjectStore.getState().addBlock(hide, scriptId, hat.id);

    runGreenFlag();
    await vi.advanceTimersByTimeAsync(200);

    const updated = useProjectStore.getState().getActiveSprite()!;
    expect(updated.visible).toBe(false);
  });

  it("stopAll sets stopRequested", () => {
    stopAll();
    expect(useRuntimeStore.getState().stopRequested).toBe(true);
  });

  it("sets speech bubble for looks_say", async () => {
    const hat = makeBlock("events_flag");
    useProjectStore.getState().addScript(hat);

    const sprite = useProjectStore.getState().getActiveSprite()!;
    const scriptId = sprite.scripts[0].id;

    const say = makeBlock("looks_say", { MESSAGE: "Hi!" });
    useProjectStore.getState().addBlock(say, scriptId, hat.id);

    runGreenFlag();
    await vi.advanceTimersByTimeAsync(200);

    const bubble = useRuntimeStore.getState().speechBubbles.get(sprite.id);
    expect(bubble?.text).toBe("Hi!");
  });
});
