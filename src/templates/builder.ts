import type { BlockInstance, Script, Sprite, Project, StageConfig } from "@/types";

let counter = 0;
function uid(): string {
  counter++;
  return `tmpl-${counter.toString(36).padStart(6, "0")}`;
}

export function resetCounter(): void {
  counter = 0;
}

interface BlockSpec {
  defId: string;
  args?: Record<string, string | number | boolean>;
  children?: BlockSpec[];
}

export function buildScript(blockSpecs: BlockSpec[]): Script {
  const blocks: Record<string, BlockInstance> = {};
  const ids: string[] = [];

  for (const spec of blockSpecs) {
    const id = uid();
    ids.push(id);
    blocks[id] = {
      id,
      definitionId: spec.defId,
      args: spec.args ?? {},
      next: null,
      parent: null,
    };

    if (spec.children && spec.children.length > 0) {
      const childIds: string[] = [];
      for (const child of spec.children) {
        const childId = uid();
        childIds.push(childId);
        blocks[childId] = {
          id: childId,
          definitionId: child.defId,
          args: child.args ?? {},
          next: null,
          parent: id,
        };
      }
      for (let i = 0; i < childIds.length - 1; i++) {
        blocks[childIds[i]].next = childIds[i + 1];
        blocks[childIds[i + 1]].parent = childIds[i];
      }
      blocks[childIds[0]].parent = id;
      blocks[id].branch = { body: childIds[0] };
    }
  }

  for (let i = 0; i < ids.length - 1; i++) {
    blocks[ids[i]].next = ids[i + 1];
    blocks[ids[i + 1]].parent = ids[i];
  }

  return {
    id: uid(),
    hatBlockId: ids[0],
    blocks,
  };
}

const DEFAULT_COSTUME = {
  name: "cat",
  url: "/tinker/assets/sprites/cat.svg",
  width: 48,
  height: 48,
  centerX: 24,
  centerY: 24,
};

export function buildSprite(
  name: string,
  scripts: Script[],
  overrides?: Partial<Sprite>,
): Sprite {
  return {
    id: uid(),
    name,
    x: 0,
    y: 0,
    direction: 90,
    size: 100,
    visible: true,
    costumes: [DEFAULT_COSTUME],
    currentCostumeIndex: 0,
    scripts,
    rotationStyle: "all_around",
    ...overrides,
  };
}

export function buildProject(
  name: string,
  sprites: Sprite[],
  stage?: Partial<StageConfig>,
): Project {
  return {
    name,
    sprites,
    stage: { width: 480, height: 360, backdrop: "#FFFFFF", ...stage },
    activeSpriteId: sprites[0]?.id ?? "",
  };
}
