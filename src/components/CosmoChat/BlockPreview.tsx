import type { ProposedBlock } from "@/types";
import { getBlockDefinition } from "@/blocks/registry";
import { Block } from "@/components/Block";

interface BlockPreviewProps {
  blocks: ProposedBlock[];
}

export function BlockPreview({ blocks }: BlockPreviewProps) {
  if (blocks.length === 0) return null;

  return (
    <div className="mt-2 flex flex-col gap-0.5 rounded-block bg-white/60 p-2">
      {blocks.map((proposed, i) => {
        const def = getBlockDefinition(proposed.definitionId);
        if (!def) return null;
        return (
          <div key={i} className="scale-90 origin-left">
            <Block definition={def} args={proposed.args} readonly />
          </div>
        );
      })}
    </div>
  );
}
