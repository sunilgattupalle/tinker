import { describe, it, expect, beforeEach } from "vitest";
import { useProjectStore, generateId } from "./project";
import type { BlockInstance } from "@/types";

function makeBlock(defId: string, overrides?: Partial<BlockInstance>): BlockInstance {
  return {
    id: generateId(),
    definitionId: defId,
    args: {},
    next: null,
    parent: null,
    ...overrides,
  };
}

describe("Project Store", () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it("creates a default project with one sprite", () => {
    const { project } = useProjectStore.getState();
    expect(project.sprites).toHaveLength(1);
    expect(project.sprites[0].name).toBe("Sprite1");
    expect(project.activeSpriteId).toBe(project.sprites[0].id);
  });

  it("sets the project name", () => {
    useProjectStore.getState().setProjectName("Cool Game");
    expect(useProjectStore.getState().project.name).toBe("Cool Game");
  });

  it("adds a script with a hat block", () => {
    const block = makeBlock("events_flag");
    useProjectStore.getState().addScript(block);

    const sprite = useProjectStore.getState().getActiveSprite()!;
    expect(sprite.scripts).toHaveLength(1);
    expect(sprite.scripts[0].blocks[block.id]).toBeDefined();
    expect(sprite.scripts[0].hatBlockId).toBe(block.id);
  });

  it("adds a block after another block in a script", () => {
    const hat = makeBlock("events_flag");
    useProjectStore.getState().addScript(hat);

    const sprite = useProjectStore.getState().getActiveSprite()!;
    const scriptId = sprite.scripts[0].id;

    const move = makeBlock("motion_move");
    useProjectStore.getState().addBlock(move, scriptId, hat.id);

    const updatedSprite = useProjectStore.getState().getActiveSprite()!;
    const script = updatedSprite.scripts[0];
    expect(script.blocks[hat.id].next).toBe(move.id);
    expect(script.blocks[move.id].parent).toBe(hat.id);
  });

  it("removes a block and re-links the chain", () => {
    const hat = makeBlock("events_flag");
    useProjectStore.getState().addScript(hat);

    const sprite = useProjectStore.getState().getActiveSprite()!;
    const scriptId = sprite.scripts[0].id;

    const block1 = makeBlock("motion_move");
    useProjectStore.getState().addBlock(block1, scriptId, hat.id);

    const block2 = makeBlock("motion_move");
    useProjectStore.getState().addBlock(block2, scriptId, block1.id);

    useProjectStore.getState().removeBlock(block1.id, scriptId);

    const updated = useProjectStore.getState().getActiveSprite()!;
    const script = updated.scripts[0];
    expect(script.blocks[block1.id]).toBeUndefined();
    expect(script.blocks[hat.id].next).toBe(block2.id);
    expect(script.blocks[block2.id].parent).toBe(hat.id);
  });

  it("removes a script", () => {
    const hat = makeBlock("events_flag");
    useProjectStore.getState().addScript(hat);

    const sprite = useProjectStore.getState().getActiveSprite()!;
    const scriptId = sprite.scripts[0].id;

    useProjectStore.getState().removeScript(scriptId);

    const updated = useProjectStore.getState().getActiveSprite()!;
    expect(updated.scripts).toHaveLength(0);
  });

  it("updates block args", () => {
    const hat = makeBlock("events_flag");
    useProjectStore.getState().addScript(hat);

    const sprite = useProjectStore.getState().getActiveSprite()!;
    const scriptId = sprite.scripts[0].id;

    const move = makeBlock("motion_move", { args: { STEPS: 10 } });
    useProjectStore.getState().addBlock(move, scriptId, hat.id);

    useProjectStore.getState().updateBlockArgs(move.id, scriptId, { STEPS: 50 });

    const updated = useProjectStore.getState().getActiveSprite()!;
    expect(updated.scripts[0].blocks[move.id].args.STEPS).toBe(50);
  });

  it("resets the project", () => {
    useProjectStore.getState().setProjectName("Test");
    useProjectStore.getState().resetProject();
    expect(useProjectStore.getState().project.name).toBe("My Project");
  });
});
