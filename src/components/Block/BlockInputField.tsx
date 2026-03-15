import { useState, useRef, useEffect } from "react";
import type { BlockInput } from "@/types";

interface BlockInputFieldProps {
  input: BlockInput;
  value: string | number | boolean;
  readonly?: boolean;
  onChange?: (name: string, value: string | number | boolean) => void;
}

export function BlockInputField({ input, value, readonly, onChange }: BlockInputFieldProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (input.type === "dropdown") {
    if (readonly) {
      return (
        <span className="inline-flex items-center rounded bg-white/90 px-1.5 py-0.5 text-xs text-gray-800">
          {String(value)} ▾
        </span>
      );
    }
    return (
      <select
        value={String(value)}
        onChange={(e) => onChange?.(input.name, e.target.value)}
        className="inline-flex cursor-pointer appearance-none rounded bg-white/90 px-1.5 py-0.5 text-xs text-gray-800 outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {input.options?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (input.type === "boolean") {
    return (
      <span className="inline-flex items-center rounded-full bg-white/90 px-1.5 py-0.5 text-xs text-gray-800">
        ◇
      </span>
    );
  }

  if (readonly) {
    return (
      <span className="inline-flex items-center rounded bg-white/90 px-1.5 py-0.5 text-xs text-gray-800">
        {String(value)}
      </span>
    );
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={input.type === "number" ? "number" : "text"}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => {
          setEditing(false);
          const parsed = input.type === "number" ? Number(editValue) : editValue;
          const finalVal = input.type === "number" && isNaN(parsed as number) ? value : parsed;
          onChange?.(input.name, finalVal);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          }
        }}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex w-12 rounded bg-white px-1.5 py-0.5 text-xs text-gray-800 outline-none ring-1 ring-white/50"
      />
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        setEditValue(String(value));
        setEditing(true);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setEditValue(String(value));
          setEditing(true);
        }
      }}
      className="inline-flex cursor-text items-center rounded bg-white/90 px-1.5 py-0.5 text-xs text-gray-800"
    >
      {String(value)}
    </span>
  );
}
