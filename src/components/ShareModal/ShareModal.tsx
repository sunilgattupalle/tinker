import { useState, useMemo } from "react";
import { useProjectStore } from "@/store/project";
import { serializeProject } from "@/community/serializer";
import { encodeProjectToURL } from "@/community/urlShare";
import { exportProjectToFile } from "@/community/fileExport";
import { generateThumbnail } from "@/community/thumbnail";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const project = useProjectStore((s) => s.project);
  const [description, setDescription] = useState("");
  const [copied, setCopied] = useState(false);

  const thumbnail = useMemo(() => {
    if (!isOpen) return "";
    const canvas = document.querySelector(
      "#sprite-stage-canvas"
    ) as HTMLCanvasElement;
    return canvas ? generateThumbnail(canvas) : "";
  }, [isOpen]);

  const { shareUrl, isTooLarge } = useMemo(() => {
    if (!isOpen) return { shareUrl: null, isTooLarge: false };

    const sharedProject = serializeProject(project, {
      description,
      thumbnail,
    });
    const url = encodeProjectToURL(sharedProject);

    return {
      shareUrl: url,
      isTooLarge: url === null,
    };
  }, [isOpen, project, description, thumbnail]);

  const handleCopyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const canvas = document.querySelector(
      "#sprite-stage-canvas"
    ) as HTMLCanvasElement;
    const thumb = canvas ? generateThumbnail(canvas) : undefined;

    const sharedProject = serializeProject(project, {
      description,
      thumbnail: thumb,
    });
    exportProjectToFile(sharedProject);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-panel-border bg-panel-bg p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 font-display text-xl font-bold text-text-primary">
          Share "{project.name}"
        </h2>

        {thumbnail && (
          <div className="mb-4 flex justify-center">
            <img
              src={thumbnail}
              alt="Project thumbnail"
              className="rounded border border-panel-border"
            />
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="description"
            className="mb-2 block font-ui text-sm text-text-secondary"
          >
            Description (optional):
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-input border border-panel-border bg-transparent px-3 py-2 font-ui text-sm text-text-primary outline-none focus:border-accent"
            rows={3}
            placeholder="What does your project do?"
          />
        </div>

        {!isTooLarge && shareUrl && (
          <div className="mb-4">
            <div className="mb-2 font-ui text-sm font-medium text-text-secondary">
              Share via link:
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 truncate rounded-input border border-panel-border bg-transparent px-3 py-2 font-ui text-xs text-text-primary outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="rounded-button border border-panel-border px-3 py-2 font-ui text-xs transition-colors hover:border-accent hover:text-accent"
              >
                {copied ? "Copied!" : "📋 Copy"}
              </button>
            </div>
          </div>
        )}

        {isTooLarge && (
          <div className="mb-4 rounded-input border border-accent bg-accent/10 p-3 font-ui text-sm text-text-primary">
            This project is too big for a link. Download the file instead!
          </div>
        )}

        <div className="mb-4">
          <div className="mb-2 font-ui text-sm font-medium text-text-secondary">
            Or download:
          </div>
          <button
            onClick={handleDownload}
            className="w-full rounded-button border border-panel-border px-4 py-2 font-ui text-sm transition-colors hover:border-accent hover:text-accent"
          >
            Download .tinker file ⬇
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-button bg-accent px-4 py-2 font-ui text-sm font-medium text-white transition-colors hover:opacity-80"
        >
          Close
        </button>
      </div>
    </div>
  );
}
