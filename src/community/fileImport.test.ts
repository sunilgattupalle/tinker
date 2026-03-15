import { describe, it, expect } from "vitest";
import { importProjectFromFile } from "./fileImport";
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

describe("importProjectFromFile", () => {
  it("should import a valid .tinker file", async () => {
    const shared = serializeProject(mockProject);
    const blob = new Blob([JSON.stringify(shared)], {
      type: "application/json",
    });
    const file = new File([blob], "test.tinker", {
      type: "application/json",
    });

    const imported = await importProjectFromFile(file);

    expect(imported.name).toBe("Test");
    expect(imported.project.sprites).toHaveLength(1);
  });

  it("should reject non-.tinker files", async () => {
    const blob = new Blob(["test"], { type: "text/plain" });
    const file = new File([blob], "test.txt", { type: "text/plain" });

    await expect(importProjectFromFile(file)).rejects.toThrow(
      "Invalid file type"
    );
  });

  it("should reject invalid JSON", async () => {
    const blob = new Blob(["invalid json"], { type: "application/json" });
    const file = new File([blob], "test.tinker", {
      type: "application/json",
    });

    await expect(importProjectFromFile(file)).rejects.toThrow(
      "doesn't look like a valid Tinker project file"
    );
  });

  it("should propagate unknown block errors", async () => {
    const shared = serializeProject(mockProject);
    shared.project.sprites[0].scripts = [
      {
        id: "script-1",
        hatBlockId: "block-1",
        blocks: {
          "block-1": {
            id: "block-1",
            definitionId: "unknown_block_xyz",
            args: {},
            next: null,
            parent: null,
          },
        },
      },
    ];

    const blob = new Blob([JSON.stringify(shared)], {
      type: "application/json",
    });
    const file = new File([blob], "test.tinker", {
      type: "application/json",
    });

    await expect(importProjectFromFile(file)).rejects.toThrow(
      /Unknown block/
    );
  });
});
