import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SpriteStage } from "./SpriteStage";

describe("SpriteStage", () => {
  it("renders the stage canvas", () => {
    render(<SpriteStage />);
    expect(screen.getByLabelText("Sprite stage")).toBeInTheDocument();
  });

  it("renders the Sprites heading", () => {
    render(<SpriteStage />);
    expect(screen.getByText("Sprites")).toBeInTheDocument();
  });

  it("renders the default Sprite1 thumbnail", () => {
    render(<SpriteStage />);
    expect(screen.getByText("Sprite1")).toBeInTheDocument();
  });
});
