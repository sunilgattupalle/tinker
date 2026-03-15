import { describe, it, expect } from "vitest";
import {
  encodeProjectToURL,
  decodeProjectFromURL,
  stripProjectFromURL,
} from "./urlShare";
import { serializeProject } from "./serializer";
import type { Project } from "@/types";

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
      costumes: [
        {
          name: "cat",
          url: "/assets/sprites/cat.svg",
          width: 48,
          height: 48,
          centerX: 24,
          centerY: 24,
        },
      ],
      currentCostumeIndex: 0,
      scripts: [],
      rotationStyle: "all_around",
    },
  ],
  stage: { width: 480, height: 360, backdrop: "#FFFFFF" },
  activeSpriteId: "s1",
};

describe("encodeProjectToURL", () => {
  it("should encode a project to URL", () => {
    const shared = serializeProject(mockProject);
    const url = encodeProjectToURL(shared);

    expect(url).toBeTruthy();
    expect(url).toContain("#p=");
  });

  it("should return null for very large projects", () => {
    const largeProject = {
      ...mockProject,
      sprites: Array.from({ length: 1000 }, (_, i) => ({
        ...mockProject.sprites[0],
        id: `sprite-${i}`,
        name: `Sprite${i}`,
        scripts: Array.from({ length: 100 }, (_, j) => ({
          id: `script-${i}-${j}`,
          hatBlockId: `block-${i}-${j}-1`,
          blocks: {
            [`block-${i}-${j}-1`]: {
              id: `block-${i}-${j}-1`,
              definitionId: "events_whenflagclicked",
              args: {},
              next: null,
              parent: null,
            },
          },
        })),
      })),
    };

    const shared = serializeProject(largeProject);
    const url = encodeProjectToURL(shared);

    expect(url).toBeNull();
  });
});

describe("decodeProjectFromURL", () => {
  it("should decode a valid URL", () => {
    const shared = serializeProject(mockProject);
    const url = encodeProjectToURL(shared);

    if (!url) throw new Error("Failed to encode URL");

    const decoded = decodeProjectFromURL(url);
    expect(decoded).toBeTruthy();
    expect(decoded?.name).toBe("Test");
    expect(decoded?.project.sprites).toHaveLength(1);
  });

  it("should return null for invalid URL", () => {
    const decoded = decodeProjectFromURL("https://example.com/");
    expect(decoded).toBeNull();
  });

  it("should return null for corrupted data", () => {
    const decoded = decodeProjectFromURL(
      "https://example.com/#p=corrupted-data"
    );
    expect(decoded).toBeNull();
  });
});

describe("stripProjectFromURL", () => {
  it("should strip the project fragment from URL", () => {
    stripProjectFromURL();
  });
});
