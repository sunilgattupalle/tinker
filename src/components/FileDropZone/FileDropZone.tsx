import { useCallback, useState } from "react";

interface FileDropZoneProps {
  onFileDrop: (file: File) => void;
}

export function FileDropZone({ onFileDrop }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const tinkerFile = files.find((f) => f.name.endsWith(".tinker"));
      if (tinkerFile) {
        onFileDrop(tinkerFile);
      }
    },
    [onFileDrop],
  );

  if (!isDragging) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-accent/90"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="rounded-lg border-4 border-dashed border-white px-16 py-12 text-center">
        <p className="font-display text-3xl font-bold text-white">
          Drop to open project
        </p>
      </div>
    </div>
  );
}
