import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { SpriteStage } from "./SpriteStage";
import { useProjectStore } from "@/store/project";

describe("SpriteStage", () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it("renders the stage canvas", () => {
    render(<SpriteStage />);
    expect(screen.getByLabelText("Sprite stage")).toBeInTheDocument();
  });

  it("renders the Sprites heading", () => {
    render(<SpriteStage />);
    expect(screen.getByText("Sprites")).toBeInTheDocument();
  });

  it("renders the default Sprite1 button", () => {
    render(<SpriteStage />);
    expect(screen.getByText("Sprite1")).toBeInTheDocument();
  });

  it("renders the add sprite button", () => {
    render(<SpriteStage />);
    expect(screen.getByLabelText("Add sprite")).toBeInTheDocument();
  });

  it("adds a new sprite when add button is clicked", async () => {
    const user = userEvent.setup();
    render(<SpriteStage />);
    await user.click(screen.getByLabelText("Add sprite"));
    expect(screen.getByText("Sprite2")).toBeInTheDocument();
  });

  it("displays position for the active sprite", () => {
    render(<SpriteStage />);
    expect(screen.getByText(/x:.*0.*y:.*0/)).toBeInTheDocument();
  });
});
