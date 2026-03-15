import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ScriptCanvas } from "./ScriptCanvas";

describe("ScriptCanvas", () => {
  it("renders the empty state message", () => {
    render(<ScriptCanvas />);
    expect(
      screen.getByText("Drag blocks here or ask Cosmo to help!"),
    ).toBeInTheDocument();
  });
});
