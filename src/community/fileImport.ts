import type { SharedProject } from "@/types";
import { deserializeProject } from "./serializer";

export async function importProjectFromFile(file: File): Promise<SharedProject> {
  if (!file.name.endsWith(".tinker")) {
    throw new Error("Invalid file type. Please select a .tinker file.");
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text) as SharedProject;

    deserializeProject(data);

    return data;
  } catch (error) {
    console.error("Failed to import project:", error);
    if (error instanceof Error && error.message.includes("Unknown block")) {
      throw error;
    }
    throw new Error("This doesn't look like a valid Tinker project file.");
  }
}
