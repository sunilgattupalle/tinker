import type { Project, SharedProject } from "@/types";
import { getBlockDefinition } from "@/blocks/registry";

export function serializeProject(
  project: Project,
  metadata?: {
    author?: string;
    description?: string;
    thumbnail?: string;
  }
): SharedProject {
  return {
    version: 1,
    name: project.name,
    author: metadata?.author,
    description: metadata?.description,
    createdAt: new Date().toISOString(),
    project: stripRuntimeState(project),
    thumbnail: metadata?.thumbnail,
  };
}

export function deserializeProject(data: SharedProject): Project {
  if (data.version !== 1) {
    throw new Error(`Unsupported project version: ${data.version}`);
  }

  const project = data.project;

  if (!project.name || !project.sprites || !project.stage) {
    throw new Error("Invalid project data: missing required fields");
  }

  for (const sprite of project.sprites) {
    for (const script of sprite.scripts) {
      for (const block of Object.values(script.blocks)) {
        const definition = getBlockDefinition(block.definitionId);
        if (!definition) {
          throw new Error(
            `Unknown block definition: ${block.definitionId}. This project uses blocks that aren't available.`
          );
        }
      }
    }
  }

  if (
    !project.sprites.some((s) => s.id === project.activeSpriteId) &&
    project.sprites.length > 0
  ) {
    project.activeSpriteId = project.sprites[0].id;
  }

  return project;
}

function stripRuntimeState(project: Project): Project {
  return {
    name: project.name,
    sprites: project.sprites.map((sprite) => ({
      id: sprite.id,
      name: sprite.name,
      x: sprite.x,
      y: sprite.y,
      direction: sprite.direction,
      size: sprite.size,
      visible: sprite.visible,
      costumes: sprite.costumes,
      currentCostumeIndex: sprite.currentCostumeIndex,
      scripts: sprite.scripts,
      rotationStyle: sprite.rotationStyle,
    })),
    stage: project.stage,
    activeSpriteId: project.activeSpriteId,
  };
}
