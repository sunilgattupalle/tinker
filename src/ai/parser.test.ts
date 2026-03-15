import { describe, it, expect } from "vitest";
import { parseAIResponse } from "./parser";

describe("parseAIResponse", () => {
  it("parses a valid JSON response", () => {
    const raw = JSON.stringify({
      explanation: "I added blocks to move the cat!",
      action: "add_script",
      targetSprite: "Sprite1",
      blocks: [
        { definitionId: "events_flag", args: {} },
        { definitionId: "motion_move", args: { STEPS: 10 } },
      ],
    });

    const result = parseAIResponse(raw);
    expect(result.explanation).toBe("I added blocks to move the cat!");
    expect(result.action).toBe("add_script");
    expect(result.proposedBlocks).toHaveLength(2);
    expect(result.proposedBlocks[0].definitionId).toBe("events_flag");
    expect(result.proposedBlocks[1].definitionId).toBe("motion_move");
    expect(result.proposedBlocks[1].args.STEPS).toBe(10);
  });

  it("extracts JSON from markdown code fences", () => {
    const raw = `Here's what I suggest:\n\`\`\`json\n${JSON.stringify({
      explanation: "Try this!",
      blocks: [{ definitionId: "motion_move", args: { STEPS: 5 } }],
    })}\n\`\`\``;

    const result = parseAIResponse(raw);
    expect(result.explanation).toBe("Try this!");
    expect(result.proposedBlocks).toHaveLength(1);
  });

  it("handles nested children blocks (control_forever)", () => {
    const raw = JSON.stringify({
      explanation: "Loop forever!",
      blocks: [
        {
          definitionId: "control_forever",
          args: {},
          children: [
            { definitionId: "motion_move", args: { STEPS: 10 } },
            { definitionId: "control_wait", args: { SECONDS: 0.5 } },
          ],
        },
      ],
    });

    const result = parseAIResponse(raw);
    expect(result.proposedBlocks).toHaveLength(3);
    expect(result.proposedBlocks[0].definitionId).toBe("control_forever");
    expect(result.proposedBlocks[1].definitionId).toBe("motion_move");
    expect(result.proposedBlocks[2].definitionId).toBe("control_wait");
  });

  it("returns error for invalid block IDs", () => {
    const raw = JSON.stringify({
      explanation: "Here you go!",
      blocks: [{ definitionId: "nonexistent_block", args: {} }],
    });

    const result = parseAIResponse(raw);
    expect(result.proposedBlocks).toHaveLength(0);
    expect(result.explanation).toContain("doesn't exist");
  });

  it("returns error for unparseable text", () => {
    const result = parseAIResponse("This is not JSON at all");
    expect(result.proposedBlocks).toHaveLength(0);
    expect(result.explanation).toContain("confused");
  });

  it("returns error for malformed JSON", () => {
    const result = parseAIResponse("{bad json!!!}");
    expect(result.proposedBlocks).toHaveLength(0);
    expect(result.explanation).toContain("confused");
  });

  it("returns error for missing blocks array", () => {
    const raw = JSON.stringify({ explanation: "Hello" });
    const result = parseAIResponse(raw);
    expect(result.proposedBlocks).toHaveLength(0);
    expect(result.explanation).toContain("mixed up");
  });

  it("defaults action to add_script", () => {
    const raw = JSON.stringify({
      explanation: "Test",
      blocks: [{ definitionId: "motion_move", args: { STEPS: 10 } }],
    });
    const result = parseAIResponse(raw);
    expect(result.action).toBe("add_script");
  });

  it("fills default args when not provided", () => {
    const raw = JSON.stringify({
      explanation: "Move!",
      blocks: [{ definitionId: "motion_move", args: {} }],
    });
    const result = parseAIResponse(raw);
    expect(result.proposedBlocks[0].args.STEPS).toBe(10);
  });
});
