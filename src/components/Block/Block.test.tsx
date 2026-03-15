import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Block } from "./Block";
import { getBlockDefinition } from "@/blocks/registry";

describe("Block", () => {
  it("renders a motion block with its label", () => {
    const def = getBlockDefinition("motion_move")!;
    render(<Block definition={def} args={{ STEPS: 10 }} readonly />);
    expect(screen.getByText("move")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("steps")).toBeInTheDocument();
  });

  it("renders a hat block", () => {
    const def = getBlockDefinition("events_flag")!;
    const { container } = render(<Block definition={def} readonly />);
    expect(container.querySelector("[data-block-def='events_flag']")).toBeInTheDocument();
  });

  it("renders a reporter block", () => {
    const def = getBlockDefinition("operators_random")!;
    const { container } = render(
      <Block definition={def} args={{ FROM: 1, TO: 10 }} readonly />,
    );
    expect(container.querySelector("[data-block-def='operators_random']")).toBeInTheDocument();
  });

  it("renders children for C-shaped blocks", () => {
    const def = getBlockDefinition("control_repeat")!;
    render(
      <Block definition={def} args={{ TIMES: 10 }} readonly>
        <div data-testid="child-block">child</div>
      </Block>,
    );
    expect(screen.getByTestId("child-block")).toBeInTheDocument();
  });

  it("renders a cap block", () => {
    const def = getBlockDefinition("control_stop")!;
    const { container } = render(<Block definition={def} readonly />);
    expect(container.querySelector("[data-block-def='control_stop']")).toBeInTheDocument();
  });
});
