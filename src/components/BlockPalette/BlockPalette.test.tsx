import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndContext } from "@dnd-kit/core";
import { describe, it, expect } from "vitest";
import { BlockPalette } from "./BlockPalette";

function renderPalette() {
  return render(
    <DndContext>
      <BlockPalette />
    </DndContext>,
  );
}

const CATEGORIES = [
  "Motion",
  "Looks",
  "Events",
  "Control",
  "Sensing",
  "Operators",
];

describe("BlockPalette", () => {
  it("renders all block categories", () => {
    renderPalette();
    for (const name of CATEGORIES) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("renders the Blocks heading", () => {
    renderPalette();
    expect(screen.getByText("Blocks")).toBeInTheDocument();
  });

  it("shows blocks for expanded categories", () => {
    renderPalette();
    expect(screen.getByText("move")).toBeInTheDocument();
  });

  it("collapses a category when its header is clicked", async () => {
    const user = userEvent.setup();
    renderPalette();

    expect(screen.getByText("move")).toBeInTheDocument();

    await user.click(screen.getByText("Motion"));

    expect(screen.queryByText("move")).not.toBeInTheDocument();
  });
});
