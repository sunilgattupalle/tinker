import { describe, it, expect, vi } from "vitest";
import { exportProjectToFile } from "./fileExport";
import { serializeProject } from "./serializer";
import type { Project } from "@/types";

const mockProject: Project = {
  name: "Test Project",
  sprites: [],
  stage: { width: 480, height: 360, backdrop: "#FFFFFF" },
  activeSpriteId: "",
};

describe("exportProjectToFile", () => {
  it("should trigger a download with correct filename", () => {
    const shared = serializeProject(mockProject);

    const mockLink = {
      click: vi.fn(),
      href: "",
      download: "",
    } as unknown as HTMLAnchorElement;
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockReturnValue(mockLink);
    const appendChildSpy = vi
      .spyOn(document.body, "appendChild")
      .mockImplementation(() => mockLink);
    const removeChildSpy = vi
      .spyOn(document.body, "removeChild")
      .mockImplementation(() => mockLink);

    exportProjectToFile(shared);

    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(mockLink.download).toBe("test-project.tinker");
    expect(mockLink.click).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
    expect(removeChildSpy).toHaveBeenCalledWith(mockLink);

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it("should sanitize filename", () => {
    const projectWithSpecialChars: Project = {
      ...mockProject,
      name: "My Cool Project! @#$%",
    };
    const shared = serializeProject(projectWithSpecialChars);

    const mockLink = {
      click: vi.fn(),
      href: "",
      download: "",
    } as unknown as HTMLAnchorElement;
    vi.spyOn(document, "createElement").mockReturnValue(mockLink);
    vi.spyOn(document.body, "appendChild").mockImplementation(() => mockLink);
    vi.spyOn(document.body, "removeChild").mockImplementation(() => mockLink);

    exportProjectToFile(shared);

    expect(mockLink.download).toBe("my-cool-project.tinker");
  });
});
