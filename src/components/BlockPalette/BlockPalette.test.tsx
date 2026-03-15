import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BlockPalette } from "./BlockPalette";

const CATEGORIES = [
  "Motion",
  "Looks",
  "Sound",
  "Events",
  "Control",
  "Sensing",
  "Operators",
];

describe("BlockPalette", () => {
  it("renders all block categories", () => {
    render(<BlockPalette />);
    for (const name of CATEGORIES) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("renders the Blocks heading", () => {
    render(<BlockPalette />);
    expect(screen.getByText("Blocks")).toBeInTheDocument();
  });
});
