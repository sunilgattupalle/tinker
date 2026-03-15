import type { BlockCategory, BlockDefinition } from "@/types";
import { blockDefinitions } from "./definitions";

const blockMap = new Map<string, BlockDefinition>(
  blockDefinitions.map((b) => [b.id, b]),
);

export function getBlockDefinition(id: string): BlockDefinition | undefined {
  return blockMap.get(id);
}

export function getBlocksByCategory(category: BlockCategory): BlockDefinition[] {
  return blockDefinitions.filter((b) => b.category === category);
}

export function getAllBlockDefinitions(): BlockDefinition[] {
  return blockDefinitions;
}
