import LZString from "lz-string";
import type { SharedProject } from "@/types";
import { deserializeProject } from "./serializer";

const MAX_URL_LENGTH = 8000;

export function encodeProjectToURL(project: SharedProject): string | null {
  try {
    const json = JSON.stringify(project);
    const compressed = LZString.compressToBase64(json);
    const url = `${window.location.origin}${window.location.pathname}#p=${compressed}`;

    if (url.length > MAX_URL_LENGTH) {
      return null;
    }

    return url;
  } catch (error) {
    console.error("Failed to encode project to URL:", error);
    return null;
  }
}

export function decodeProjectFromURL(url: string): SharedProject | null {
  try {
    const hashIndex = url.indexOf("#p=");
    if (hashIndex === -1) {
      const hash = window.location.hash;
      if (!hash.startsWith("#p=")) {
        return null;
      }
      const compressed = hash.substring(3);
      return decodeCompressedProject(compressed);
    }

    const compressed = url.substring(hashIndex + 3);
    return decodeCompressedProject(compressed);
  } catch (error) {
    console.error("Failed to decode project from URL:", error);
    return null;
  }
}

function decodeCompressedProject(compressed: string): SharedProject | null {
  try {
    const decompressed = LZString.decompressFromBase64(compressed);
    if (!decompressed) {
      return null;
    }

    const data = JSON.parse(decompressed) as SharedProject;
    deserializeProject(data);
    return data;
  } catch (error) {
    console.error("Failed to decompress project:", error);
    return null;
  }
}

export function getProjectFromCurrentURL(): SharedProject | null {
  return decodeProjectFromURL(window.location.href);
}

export function stripProjectFromURL(): void {
  if (window.location.hash.startsWith("#p=")) {
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );
  }
}
