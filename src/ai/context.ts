import type { Project, ProjectContext } from "@/types";
import { getBlockDefinition, getAllBlockDefinitions } from "@/blocks/registry";

export function buildProjectContext(project: Project): ProjectContext {
  return {
    sprites: project.sprites.map((sprite) => ({
      name: sprite.name,
      scripts: sprite.scripts,
    })),
    activeSpriteId: project.activeSpriteId,
    availableBlocks: getAllBlockDefinitions().map((b) => b.id),
  };
}

export function describeProject(project: Project): string {
  const lines: string[] = [];
  lines.push(`Project: "${project.name}"`);
  lines.push(`Sprites: ${project.sprites.map((s) => s.name).join(", ")}`);

  const activeSprite = project.sprites.find(
    (s) => s.id === project.activeSpriteId,
  );
  if (activeSprite) {
    lines.push(`Active sprite: ${activeSprite.name} (x:${Math.round(activeSprite.x)}, y:${Math.round(activeSprite.y)})`);
    if (activeSprite.scripts.length === 0) {
      lines.push("Scripts: none yet");
    } else {
      for (const script of activeSprite.scripts) {
        const hat = script.blocks[script.hatBlockId];
        if (!hat) continue;
        const desc = describeBlockChain(hat, script.blocks);
        lines.push(`Script: ${desc}`);
      }
    }
  }

  return lines.join("\n");
}

function describeBlockChain(
  block: { definitionId: string; next: string | null; args: Record<string, string | number | boolean> },
  blocks: Record<string, { definitionId: string; next: string | null; args: Record<string, string | number | boolean> }>,
  depth = 0,
): string {
  if (depth > 20) return "...";
  const def = getBlockDefinition(block.definitionId);
  const label = def ? formatLabel(def.label, block.args) : block.definitionId;
  const parts = [label];

  if (block.next && blocks[block.next]) {
    parts.push(describeBlockChain(blocks[block.next], blocks, depth + 1));
  }

  return parts.join(" → ");
}

function formatLabel(
  label: string,
  args: Record<string, string | number | boolean>,
): string {
  return label.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(args[key] ?? key),
  );
}
