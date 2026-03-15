import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShareModal } from "./ShareModal";
import { useProjectStore } from "@/store/project";

vi.mock("@/store/project", () => ({
  useProjectStore: vi.fn(),
}));

import type { Project } from "@/types";

describe("ShareModal", () => {
  it("should not render when closed", () => {
    const mockProject: Project = {
      name: "Test",
      sprites: [],
      stage: { width: 480, height: 360, backdrop: "#FFFFFF" },
      activeSpriteId: "",
    };
    vi.mocked(useProjectStore).mockImplementation(
      ((selector: (state: { project: Project }) => Project) =>
        selector({ project: mockProject })) as typeof useProjectStore
    );

    const { container } = render(
      <ShareModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render when open", () => {
    const mockProject: Project = {
      name: "Test Project",
      sprites: [
        {
          id: "s1",
          name: "Sprite1",
          x: 0,
          y: 0,
          direction: 90,
          size: 100,
          visible: true,
          costumes: [],
          currentCostumeIndex: 0,
          scripts: [],
          rotationStyle: "all_around",
        },
      ],
      stage: { width: 480, height: 360, backdrop: "#FFFFFF" },
      activeSpriteId: "s1",
    };
    vi.mocked(useProjectStore).mockImplementation(
      ((selector: (state: { project: Project }) => Project) =>
        selector({ project: mockProject })) as typeof useProjectStore
    );

    render(<ShareModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Share "Test Project"')).toBeDefined();
  });

  it("should show close button", () => {
    const mockProject: Project = {
      name: "Test",
      sprites: [
        {
          id: "s1",
          name: "Sprite1",
          x: 0,
          y: 0,
          direction: 90,
          size: 100,
          visible: true,
          costumes: [],
          currentCostumeIndex: 0,
          scripts: [],
          rotationStyle: "all_around",
        },
      ],
      stage: { width: 480, height: 360, backdrop: "#FFFFFF" },
      activeSpriteId: "s1",
    };
    vi.mocked(useProjectStore).mockImplementation(
      ((selector: (state: { project: Project }) => Project) =>
        selector({ project: mockProject })) as typeof useProjectStore
    );

    render(<ShareModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("Close")).toBeDefined();
  });
});
