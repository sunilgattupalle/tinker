import type { CosmoResponse, ProposedBlock } from "@/types";
import { getBlockDefinition } from "@/blocks/registry";

interface RawBlock {
  definitionId: string;
  args?: Record<string, string | number | boolean>;
  children?: RawBlock[];
}

interface RawResponse {
  explanation: string;
  action?: string;
  targetSprite?: string;
  blocks: RawBlock[];
}

export function parseAIResponse(raw: string): CosmoResponse {
  const json = extractJSON(raw);
  if (!json) {
    return errorResponse("I got a little confused. Could you try asking in a different way?");
  }

  let parsed: RawResponse;
  try {
    parsed = JSON.parse(json);
  } catch {
    return errorResponse("I got a little confused. Could you try asking in a different way?");
  }

  if (!parsed.explanation || !Array.isArray(parsed.blocks)) {
    return errorResponse("Hmm, my response got mixed up. Try again?");
  }

  const proposedBlocks: ProposedBlock[] = [];
  let position = 0;

  for (const rawBlock of parsed.blocks) {
    const flattened = flattenBlock(rawBlock, position);
    if (flattened === null) {
      return errorResponse(
        `I tried to use a block "${rawBlock.definitionId}" that doesn't exist. Let me try again!`,
      );
    }
    proposedBlocks.push(...flattened.blocks);
    position = flattened.nextPosition;
  }

  const action = parsed.action === "modify_script"
    ? "modify_script"
    : parsed.action === "add_blocks"
      ? "add_blocks"
      : "add_script";

  return {
    explanation: parsed.explanation,
    proposedBlocks,
    targetSpriteId: parsed.targetSprite ?? "",
    action,
  };
}

function flattenBlock(
  raw: RawBlock,
  startPos: number,
): { blocks: ProposedBlock[]; nextPosition: number } | null {
  const def = getBlockDefinition(raw.definitionId);
  if (!def) return null;

  const blocks: ProposedBlock[] = [];
  const args: Record<string, string | number | boolean> = {};

  for (const input of def.inputs) {
    args[input.name] = raw.args?.[input.name] ?? input.default;
  }

  blocks.push({ definitionId: raw.definitionId, args, position: startPos });
  let pos = startPos + 1;

  if (raw.children) {
    for (const child of raw.children) {
      const flattened = flattenBlock(child, pos);
      if (!flattened) return null;
      blocks.push(...flattened.blocks);
      pos = flattened.nextPosition;
    }
  }

  return { blocks, nextPosition: pos };
}

function extractJSON(text: string): string | null {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) return braceMatch[0];

  return null;
}

function errorResponse(explanation: string): CosmoResponse {
  return {
    explanation,
    proposedBlocks: [],
    targetSpriteId: "",
    action: "add_script",
  };
}
