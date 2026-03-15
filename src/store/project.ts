import { create } from "zustand";
import type { BlockInstance, Project, Sprite } from "@/types";
import { C_SHAPED_BLOCKS } from "@/blocks/definitions";

function generateId(): string {
  return crypto.randomUUID();
}

function createDefaultSprite(): Sprite {
  return {
    id: generateId(),
    name: "Sprite1",
    x: 0,
    y: 0,
    direction: 90,
    size: 100,
    visible: true,
    costumes: [
      {
        name: "cat",
        url: "/tinker/assets/sprites/cat.svg",
        width: 48,
        height: 48,
        centerX: 24,
        centerY: 24,
      },
    ],
    currentCostumeIndex: 0,
    scripts: [],
    rotationStyle: "all_around",
  };
}

function createDefaultProject(): Project {
  const sprite = createDefaultSprite();
  return {
    name: "My Project",
    sprites: [sprite],
    stage: { width: 480, height: 360, backdrop: "#FFFFFF" },
    activeSpriteId: sprite.id,
  };
}

interface ProjectStoreState {
  project: Project;

  getActiveSprite: () => Sprite | undefined;
  getSpriteById: (id: string) => Sprite | undefined;
  updateSprite: (id: string, updater: (sprite: Sprite) => Sprite) => void;

  addSprite: (sprite: Sprite) => void;
  removeSprite: (id: string) => void;
  setActiveSprite: (id: string) => void;

  addScript: (hatBlock: BlockInstance) => void;
  removeScript: (scriptId: string) => void;

  addBlock: (block: BlockInstance, scriptId: string, afterBlockId: string | null) => void;
  removeBlock: (blockId: string, scriptId: string) => void;
  moveBlock: (blockId: string, fromScriptId: string, toScriptId: string, afterBlockId: string | null) => void;
  updateBlockArgs: (blockId: string, scriptId: string, args: Record<string, string | number | boolean>) => void;

  addBlockToBody: (block: BlockInstance, scriptId: string, parentBlockId: string) => void;

  setProjectName: (name: string) => void;
  loadProject: (project: Project) => void;
  resetProject: () => void;
}

function updateActiveSprite(project: Project, updater: (sprite: Sprite) => Sprite): Project {
  return {
    ...project,
    sprites: project.sprites.map((s) =>
      s.id === project.activeSpriteId ? updater(s) : s,
    ),
  };
}

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  project: createDefaultProject(),

  getActiveSprite: () => {
    const { project } = get();
    return project.sprites.find((s) => s.id === project.activeSpriteId);
  },

  getSpriteById: (id) => {
    const { project } = get();
    return project.sprites.find((s) => s.id === id);
  },

  updateSprite: (id, updater) =>
    set((state) => ({
      project: {
        ...state.project,
        sprites: state.project.sprites.map((s) =>
          s.id === id ? updater(s) : s,
        ),
      },
    })),

  addSprite: (sprite) =>
    set((state) => ({
      project: {
        ...state.project,
        sprites: [...state.project.sprites, sprite],
      },
    })),

  removeSprite: (id) =>
    set((state) => ({
      project: {
        ...state.project,
        sprites: state.project.sprites.filter((s) => s.id !== id),
      },
    })),

  setActiveSprite: (id) =>
    set((state) => ({
      project: { ...state.project, activeSpriteId: id },
    })),

  addScript: (hatBlock) =>
    set((state) => ({
      project: updateActiveSprite(state.project, (sprite) => ({
        ...sprite,
        scripts: [
          ...sprite.scripts,
          {
            id: generateId(),
            hatBlockId: hatBlock.id,
            blocks: { [hatBlock.id]: hatBlock },
          },
        ],
      })),
    })),

  removeScript: (scriptId) =>
    set((state) => ({
      project: updateActiveSprite(state.project, (sprite) => ({
        ...sprite,
        scripts: sprite.scripts.filter((s) => s.id !== scriptId),
      })),
    })),

  addBlock: (block, scriptId, afterBlockId) =>
    set((state) => ({
      project: updateActiveSprite(state.project, (sprite) => ({
        ...sprite,
        scripts: sprite.scripts.map((script) => {
          if (script.id !== scriptId) return script;
          const blocks = { ...script.blocks, [block.id]: block };

          if (afterBlockId && blocks[afterBlockId]) {
            const prev = blocks[afterBlockId];
            block.next = prev.next;
            block.parent = afterBlockId;
            if (prev.next && blocks[prev.next]) {
              blocks[prev.next] = { ...blocks[prev.next], parent: block.id };
            }
            blocks[afterBlockId] = { ...prev, next: block.id };
          }

          return { ...script, blocks };
        }),
      })),
    })),

  removeBlock: (blockId, scriptId) =>
    set((state) => ({
      project: updateActiveSprite(state.project, (sprite) => ({
        ...sprite,
        scripts: sprite.scripts.map((script) => {
          if (script.id !== scriptId) return script;
          const block = script.blocks[blockId];
          if (!block) return script;

          const blocks = { ...script.blocks };

          if (block.parent && blocks[block.parent]) {
            const parentBlock = blocks[block.parent];
            if (parentBlock.next === blockId) {
              blocks[block.parent] = { ...parentBlock, next: block.next };
            }
            if (parentBlock.branch) {
              const updatedBranch = { ...parentBlock.branch };
              for (const [key, val] of Object.entries(updatedBranch)) {
                if (val === blockId) {
                  updatedBranch[key] = block.next ?? "";
                }
              }
              blocks[block.parent] = { ...blocks[block.parent], branch: updatedBranch };
            }
          }

          if (block.next && blocks[block.next]) {
            blocks[block.next] = { ...blocks[block.next], parent: block.parent };
          }

          delete blocks[blockId];

          if (script.hatBlockId === blockId) {
            return { ...script, hatBlockId: block.next ?? "", blocks };
          }

          return { ...script, blocks };
        }),
      })),
    })),

  moveBlock: (blockId, fromScriptId, toScriptId, afterBlockId) => {
    const state = get();
    const sprite = state.project.sprites.find(
      (s) => s.id === state.project.activeSpriteId,
    );
    if (!sprite) return;

    const fromScript = sprite.scripts.find((s) => s.id === fromScriptId);
    if (!fromScript) return;
    const block = fromScript.blocks[blockId];
    if (!block) return;

    state.removeBlock(blockId, fromScriptId);
    state.addBlock(
      { ...block, parent: afterBlockId, next: null },
      toScriptId,
      afterBlockId,
    );
  },

  addBlockToBody: (block, scriptId, parentBlockId) =>
    set((state) => ({
      project: updateActiveSprite(state.project, (sprite) => ({
        ...sprite,
        scripts: sprite.scripts.map((script) => {
          if (script.id !== scriptId) return script;
          const parentDef = script.blocks[parentBlockId];
          if (!parentDef) return script;

          const blocks = { ...script.blocks, [block.id]: { ...block, parent: parentBlockId } };
          const existingBodyId = parentDef.branch?.body;

          if (existingBodyId && blocks[existingBodyId]) {
            blocks[block.id] = { ...blocks[block.id], next: existingBodyId };
            blocks[existingBodyId] = { ...blocks[existingBodyId], parent: block.id };
          }

          blocks[parentBlockId] = {
            ...parentDef,
            branch: { ...parentDef.branch, body: block.id },
          };

          return { ...script, blocks };
        }),
      })),
    })),

  updateBlockArgs: (blockId, scriptId, args) =>
    set((state) => ({
      project: updateActiveSprite(state.project, (sprite) => ({
        ...sprite,
        scripts: sprite.scripts.map((script) => {
          if (script.id !== scriptId) return script;
          const block = script.blocks[blockId];
          if (!block) return script;
          return {
            ...script,
            blocks: {
              ...script.blocks,
              [blockId]: { ...block, args: { ...block.args, ...args } },
            },
          };
        }),
      })),
    })),

  setProjectName: (name) =>
    set((state) => ({ project: { ...state.project, name } })),

  loadProject: (project) => set({ project }),

  resetProject: () => set({ project: createDefaultProject() }),
}));

export { generateId };
export { C_SHAPED_BLOCKS };
