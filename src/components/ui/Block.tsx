import { useState, useRef, useEffect } from 'react'
import type { OpcodeInfo } from '@/scratch/opcodes'
import type { UIBlock } from '@/types'

export interface BlockProps {
  info: OpcodeInfo
  block?: UIBlock
  isOverlay?: boolean
  isPalette?: boolean
  onInputChange?: (inputName: string, value: unknown) => void
  onFieldChange?: (fieldName: string, value: unknown) => void
  children?: React.ReactNode
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (num >> 16) - amount)
  const g = Math.max(0, ((num >> 8) & 0xff) - amount)
  const b = Math.max(0, (num & 0xff) - amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function InlineInput({
  value,
  type,
  readOnly,
  onChange,
}: {
  value: unknown
  type: string
  readOnly: boolean
  onChange?: (val: unknown) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(String(value ?? ''))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  if (readOnly || !onChange) {
    return (
      <span className="inline-flex min-w-[28px] items-center justify-center rounded bg-white/30 px-1.5 py-0.5 text-xs font-semibold text-white">
        {String(value ?? '')}
      </span>
    )
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type === 'number' ? 'number' : 'text'}
        value={editVal}
        onChange={(e) => setEditVal(e.target.value)}
        onBlur={() => {
          setEditing(false)
          onChange(type === 'number' ? Number(editVal) || 0 : editVal)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setEditing(false)
            onChange(type === 'number' ? Number(editVal) || 0 : editVal)
          }
          e.stopPropagation()
        }}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex w-14 items-center rounded border-none bg-white px-1.5 py-0.5 text-center text-xs font-semibold text-gray-800 outline-none"
        aria-label={`Edit ${type} value`}
      />
    )
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        setEditVal(String(value ?? ''))
        setEditing(true)
      }}
      className="inline-flex min-w-[28px] cursor-text items-center justify-center rounded bg-white px-1.5 py-0.5 text-xs font-semibold text-gray-800 hover:bg-white/90"
    >
      {String(value ?? '')}
    </button>
  )
}

function InlineDropdown({
  value,
  options,
  readOnly,
  onChange,
}: {
  value: unknown
  options: string[]
  readOnly: boolean
  onChange?: (val: unknown) => void
}) {
  if (readOnly || !onChange) {
    return (
      <span className="inline-flex min-w-[40px] items-center justify-center rounded bg-white/30 px-1.5 py-0.5 text-xs font-semibold text-white">
        {String(value ?? '')} ▾
      </span>
    )
  }

  return (
    <select
      value={String(value ?? '')}
      onChange={(e) => {
        e.stopPropagation()
        onChange(e.target.value)
      }}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex min-w-[40px] cursor-pointer appearance-none rounded border-none bg-white px-1.5 py-0.5 text-xs font-semibold text-gray-800 outline-none"
      aria-label="Select option"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  )
}

function renderLabel(
  label: string,
  info: OpcodeInfo,
  block: UIBlock | undefined,
  readOnly: boolean,
  onInputChange?: (name: string, val: unknown) => void,
  onFieldChange?: (name: string, val: unknown) => void,
) {
  const parts = label.split(/(\{[A-Z_]+\})/g)

  return parts.map((part, i) => {
    const match = part.match(/^\{([A-Z_]+)\}$/)
    if (!match) return <span key={i}>{part}</span>

    const name = match[1]

    // Check fields first
    const fieldDef = info.fields.find((f) => f.name === name)
    if (fieldDef?.options) {
      const value = block?.fields[name]?.value ?? fieldDef.defaultValue
      return (
        <InlineDropdown
          key={i}
          value={value}
          options={fieldDef.options}
          readOnly={readOnly}
          onChange={onFieldChange ? (v) => onFieldChange(name, v) : undefined}
        />
      )
    }

    // Check inputs
    const inputDef = info.inputs.find((inp) => inp.name === name)
    if (inputDef) {
      const value = block?.inputs[name]?.value ?? inputDef.defaultValue
      return (
        <InlineInput
          key={i}
          value={value}
          type={inputDef.type}
          readOnly={readOnly}
          onChange={onInputChange ? (v) => onInputChange(name, v) : undefined}
        />
      )
    }

    return <span key={i}>{part}</span>
  })
}

export function Block({
  info,
  block,
  isOverlay,
  isPalette,
  onInputChange,
  onFieldChange,
  children,
}: BlockProps) {
  const readOnly = isPalette || isOverlay || false
  const color = info.color
  const borderColor = darken(color, 30)

  const shapeClasses = (() => {
    switch (info.shape) {
      case 'hat':
        return 'rounded-t-[16px] rounded-b-block'
      case 'cap':
        return 'rounded-t-block rounded-b-none'
      case 'reporter':
        return 'rounded-reporter'
      case 'boolean':
        return '' // custom clip-path
      default:
        return 'rounded-block'
    }
  })()

  const hasSubstack = info.hasSubstack

  return (
    <div
      className={`relative select-none ${isOverlay ? 'opacity-80' : ''}`}
      data-block-id={block?.id}
      data-opcode={info.opcode}
    >
      {/* Main block body */}
      <div
        className={`flex min-h-block-h items-center gap-1 px-3 py-1.5 font-nunito text-sm font-semibold text-white shadow-sm ${shapeClasses}`}
        style={{
          backgroundColor: color,
          borderLeft: `2px solid ${borderColor}`,
          borderBottom: info.shape !== 'cap' ? `2px solid ${borderColor}` : 'none',
          ...(info.shape === 'boolean'
            ? {
                clipPath: 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0% 50%)',
                paddingLeft: '16px',
                paddingRight: '16px',
                borderRadius: '0',
                borderLeft: 'none',
                borderBottom: 'none',
              }
            : {}),
        }}
      >
        {renderLabel(info.label, info, block, readOnly, onInputChange, onFieldChange)}
      </div>

      {/* C-shape body for blocks with substacks */}
      {hasSubstack && (
        <div className="flex">
          <div
            className="w-4 min-h-[32px]"
            style={{ backgroundColor: color, borderLeft: `2px solid ${borderColor}` }}
          />
          <div className="min-h-[32px] flex-1 rounded-br bg-app-background/50 p-1">
            {children}
          </div>
        </div>
      )}

      {/* C-shape bottom bar */}
      {hasSubstack && (
        <div
          className="flex h-6 items-center rounded-b-block px-3"
          style={{
            backgroundColor: color,
            borderLeft: `2px solid ${borderColor}`,
            borderBottom: `2px solid ${borderColor}`,
          }}
        />
      )}

      {/* Notch for stack blocks (visual indicator) */}
      {(info.shape === 'stack' || info.shape === 'cap') && !hasSubstack && (
        <div
          className="absolute left-4 top-0 h-1 w-3"
          style={{ backgroundColor: borderColor }}
        />
      )}
    </div>
  )
}
