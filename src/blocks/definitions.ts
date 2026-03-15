import type { BlockDefinition } from "@/types";

const COLORS = {
  motion: "#4C97FF",
  looks: "#9966FF",
  sound: "#CF63CF",
  events: "#FFBF00",
  control: "#FFAB19",
  sensing: "#5CB1D6",
  operators: "#59C059",
  variables: "#FF8C1A",
} as const;

const KEY_OPTIONS = [
  "space",
  "up arrow",
  "down arrow",
  "left arrow",
  "right arrow",
  ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)),
];

export const blockDefinitions: BlockDefinition[] = [
  // ── Motion ──────────────────────────────────────────
  {
    id: "motion_move",
    category: "motion",
    label: "move {STEPS} steps",
    color: COLORS.motion,
    shape: "stack",
    inputs: [{ name: "STEPS", type: "number", default: 10 }],
  },
  {
    id: "motion_turn_right",
    category: "motion",
    label: "turn ↻ {DEGREES} degrees",
    color: COLORS.motion,
    shape: "stack",
    inputs: [{ name: "DEGREES", type: "number", default: 15 }],
  },
  {
    id: "motion_turn_left",
    category: "motion",
    label: "turn ↺ {DEGREES} degrees",
    color: COLORS.motion,
    shape: "stack",
    inputs: [{ name: "DEGREES", type: "number", default: 15 }],
  },
  {
    id: "motion_goto_xy",
    category: "motion",
    label: "go to x: {X} y: {Y}",
    color: COLORS.motion,
    shape: "stack",
    inputs: [
      { name: "X", type: "number", default: 0 },
      { name: "Y", type: "number", default: 0 },
    ],
  },
  {
    id: "motion_set_x",
    category: "motion",
    label: "set x to {X}",
    color: COLORS.motion,
    shape: "stack",
    inputs: [{ name: "X", type: "number", default: 0 }],
  },
  {
    id: "motion_set_y",
    category: "motion",
    label: "set y to {Y}",
    color: COLORS.motion,
    shape: "stack",
    inputs: [{ name: "Y", type: "number", default: 0 }],
  },

  // ── Looks ───────────────────────────────────────────
  {
    id: "looks_say",
    category: "looks",
    label: "say {MESSAGE}",
    color: COLORS.looks,
    shape: "stack",
    inputs: [{ name: "MESSAGE", type: "string", default: "Hello!" }],
  },
  {
    id: "looks_say_for",
    category: "looks",
    label: "say {MESSAGE} for {SECONDS} seconds",
    color: COLORS.looks,
    shape: "stack",
    inputs: [
      { name: "MESSAGE", type: "string", default: "Hello!" },
      { name: "SECONDS", type: "number", default: 2 },
    ],
  },
  {
    id: "looks_show",
    category: "looks",
    label: "show",
    color: COLORS.looks,
    shape: "stack",
    inputs: [],
  },
  {
    id: "looks_hide",
    category: "looks",
    label: "hide",
    color: COLORS.looks,
    shape: "stack",
    inputs: [],
  },
  {
    id: "looks_set_size",
    category: "looks",
    label: "set size to {PERCENT}%",
    color: COLORS.looks,
    shape: "stack",
    inputs: [{ name: "PERCENT", type: "number", default: 100 }],
  },

  // ── Events (hat blocks) ────────────────────────────
  {
    id: "events_flag",
    category: "events",
    label: "when 🟢 clicked",
    color: COLORS.events,
    shape: "hat",
    inputs: [],
  },
  {
    id: "events_key",
    category: "events",
    label: "when {KEY} key pressed",
    color: COLORS.events,
    shape: "hat",
    inputs: [
      { name: "KEY", type: "dropdown", default: "space", options: KEY_OPTIONS },
    ],
  },
  {
    id: "events_sprite_clicked",
    category: "events",
    label: "when this sprite clicked",
    color: COLORS.events,
    shape: "hat",
    inputs: [],
  },

  // ── Control ─────────────────────────────────────────
  {
    id: "control_wait",
    category: "control",
    label: "wait {SECONDS} seconds",
    color: COLORS.control,
    shape: "stack",
    inputs: [{ name: "SECONDS", type: "number", default: 1 }],
  },
  {
    id: "control_repeat",
    category: "control",
    label: "repeat {TIMES}",
    color: COLORS.control,
    shape: "stack",
    inputs: [{ name: "TIMES", type: "number", default: 10 }],
  },
  {
    id: "control_forever",
    category: "control",
    label: "forever",
    color: COLORS.control,
    shape: "stack",
    inputs: [],
  },
  {
    id: "control_if",
    category: "control",
    label: "if {CONDITION} then",
    color: COLORS.control,
    shape: "stack",
    inputs: [{ name: "CONDITION", type: "boolean", default: true }],
  },
  {
    id: "control_stop",
    category: "control",
    label: "stop all",
    color: COLORS.control,
    shape: "cap",
    inputs: [],
  },

  // ── Sensing ─────────────────────────────────────────
  {
    id: "sensing_key_pressed",
    category: "sensing",
    label: "key {KEY} pressed?",
    color: COLORS.sensing,
    shape: "boolean",
    inputs: [
      { name: "KEY", type: "dropdown", default: "space", options: KEY_OPTIONS },
    ],
  },

  // ── Operators ───────────────────────────────────────
  {
    id: "operators_random",
    category: "operators",
    label: "pick random {FROM} to {TO}",
    color: COLORS.operators,
    shape: "reporter",
    inputs: [
      { name: "FROM", type: "number", default: 1 },
      { name: "TO", type: "number", default: 10 },
    ],
  },
  {
    id: "operators_add",
    category: "operators",
    label: "{A} + {B}",
    color: COLORS.operators,
    shape: "reporter",
    inputs: [
      { name: "A", type: "number", default: 0 },
      { name: "B", type: "number", default: 0 },
    ],
  },
];

export const C_SHAPED_BLOCKS = new Set([
  "control_repeat",
  "control_forever",
  "control_if",
]);
