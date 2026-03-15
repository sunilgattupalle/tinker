import { describe, it, expect } from "vitest";
import { getBlockDefinition, getBlocksByCategory, getAllBlockDefinitions } from "./registry";

describe("Block Registry", () => {
  it("returns all block definitions", () => {
    const all = getAllBlockDefinitions();
    expect(all.length).toBeGreaterThan(0);
  });

  it("retrieves a block by ID", () => {
    const block = getBlockDefinition("motion_move");
    expect(block).toBeDefined();
    expect(block!.label).toContain("move");
    expect(block!.category).toBe("motion");
  });

  it("returns undefined for unknown ID", () => {
    expect(getBlockDefinition("nonexistent")).toBeUndefined();
  });

  it("filters blocks by category", () => {
    const motion = getBlocksByCategory("motion");
    expect(motion.length).toBeGreaterThanOrEqual(6);
    for (const b of motion) {
      expect(b.category).toBe("motion");
    }
  });

  it("includes hat blocks in events category", () => {
    const events = getBlocksByCategory("events");
    expect(events.some((b) => b.shape === "hat")).toBe(true);
  });

  it("includes reporter blocks in operators category", () => {
    const ops = getBlocksByCategory("operators");
    expect(ops.some((b) => b.shape === "reporter")).toBe(true);
  });

  it("includes a cap block in control category", () => {
    const control = getBlocksByCategory("control");
    expect(control.some((b) => b.shape === "cap")).toBe(true);
  });
});
