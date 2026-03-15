import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Toolbar } from "./Toolbar";

describe("Toolbar", () => {
  it("renders run and stop buttons", () => {
    render(<Toolbar />);
    expect(screen.getByLabelText("Run project")).toBeInTheDocument();
    expect(screen.getByLabelText("Stop project")).toBeInTheDocument();
  });

  it("renders an editable project name defaulting to My Project", () => {
    render(<Toolbar />);
    const input = screen.getByLabelText("Project name");
    expect(input).toHaveValue("My Project");
  });

  it("allows editing the project name", async () => {
    const user = userEvent.setup();
    render(<Toolbar />);
    const input = screen.getByLabelText("Project name");
    await user.clear(input);
    await user.type(input, "Cool Game");
    expect(input).toHaveValue("Cool Game");
  });

  it("renders the Cosmo avatar placeholder", () => {
    render(<Toolbar />);
    expect(screen.getByLabelText("Cosmo avatar")).toBeInTheDocument();
  });
});
