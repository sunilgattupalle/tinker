import type { BlockDefinition, BlockInput } from "@/types";
import { BlockInputField } from "./BlockInputField";

interface BlockProps {
  definition: BlockDefinition;
  args?: Record<string, string | number | boolean>;
  readonly?: boolean;
  onArgsChange?: (name: string, value: string | number | boolean) => void;
  children?: React.ReactNode;
  id?: string;
}

function parseLabel(
  label: string,
  inputs: BlockInput[],
  args: Record<string, string | number | boolean>,
  readonly: boolean,
  onArgsChange?: (name: string, value: string | number | boolean) => void,
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\{(\w+)\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(label)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`t-${lastIndex}`}>{label.slice(lastIndex, match.index)}</span>,
      );
    }
    const inputName = match[1];
    const input = inputs.find((inp) => inp.name === inputName);
    if (input) {
      parts.push(
        <BlockInputField
          key={`i-${inputName}`}
          input={input}
          value={args[inputName] ?? input.default}
          readonly={readonly}
          onChange={onArgsChange}
        />,
      );
    } else {
      parts.push(<span key={`m-${lastIndex}`}>{match[0]}</span>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < label.length) {
    parts.push(<span key={`e-${lastIndex}`}>{label.slice(lastIndex)}</span>);
  }
  return parts;
}

function shapeClasses(shape: BlockDefinition["shape"]): string {
  switch (shape) {
    case "hat":
      return "rounded-t-2xl rounded-b-block";
    case "cap":
      return "rounded-t-block rounded-b-lg";
    case "reporter":
      return "rounded-reporter";
    case "boolean":
      return "rounded-reporter";
    default:
      return "rounded-block";
  }
}

export function Block({
  definition,
  args = {},
  readonly = false,
  onArgsChange,
  children,
  id,
}: BlockProps) {
  const isCShape = children !== undefined;

  return (
    <div
      data-block-id={id}
      data-block-def={definition.id}
      className={`group relative select-none shadow-sm ${shapeClasses(definition.shape)}`}
      style={{
        backgroundColor: definition.color,
        borderColor: darken(definition.color, 0.15),
        borderWidth: "1px",
        borderStyle: "solid",
      }}
    >
      <div className="flex min-h-block-h items-center gap-1 px-3 py-1 font-display text-sm font-semibold text-white">
        {parseLabel(definition.label, definition.inputs, args, readonly, onArgsChange)}
      </div>

      {isCShape && (
        <>
          <div
            className="ml-4 min-h-[32px] border-l-4 border-t border-b pl-1 py-1"
            style={{
              borderColor: darken(definition.color, 0.15),
              backgroundColor: darken(definition.color, 0.08),
            }}
            data-body-drop="true"
          >
            {children}
          </div>
          <div
            className="flex min-h-[16px] items-center rounded-b-block px-3"
            style={{ backgroundColor: definition.color }}
          />
        </>
      )}
    </div>
  );
}

function darken(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const dr = Math.round(r * (1 - amount));
  const dg = Math.round(g * (1 - amount));
  const db = Math.round(b * (1 - amount));
  return `#${dr.toString(16).padStart(2, "0")}${dg.toString(16).padStart(2, "0")}${db.toString(16).padStart(2, "0")}`;
}
