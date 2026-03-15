import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { App } from "./App";
import { useProjectStore } from "./store/project";

describe("App", () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it("renders all five layout areas", () => {
    render(<App />);

    expect(screen.getByLabelText("Run project")).toBeInTheDocument();
    expect(screen.getByLabelText("Stop project")).toBeInTheDocument();
    expect(screen.getByText("Blocks")).toBeInTheDocument();
    expect(
      screen.getByText("Drag blocks here or ask Cosmo to help!"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Sprite stage")).toBeInTheDocument();
    expect(screen.getByLabelText("Chat input")).toBeInTheDocument();
  });

  it("renders the project name input", () => {
    render(<App />);
    expect(screen.getByLabelText("Project name")).toHaveValue("My Project");
  });

  it("renders the Cosmo welcome message", () => {
    render(<App />);
    expect(
      screen.getByText(/I'm Cosmo.*Tell me what you want to build/),
    ).toBeInTheDocument();
  });

  it("renders block categories with blocks", () => {
    render(<App />);
    expect(screen.getByText("Motion")).toBeInTheDocument();
    expect(screen.getByText("Control")).toBeInTheDocument();
    expect(screen.getByText("Events")).toBeInTheDocument();
  });
});
