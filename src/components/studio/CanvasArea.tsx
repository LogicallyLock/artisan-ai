import { useState, useRef } from "react";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Upload, ImagePlus } from "lucide-react";
import sampleImage from "@/assets/sample-canvas.jpg";

interface CanvasAreaProps {
  canvasImageUrl?: string | null;
  onImageUpload?: (url: string) => void;
}

export function CanvasArea({ canvasImageUrl, onImageUpload }: CanvasAreaProps) {
  const [zoom, setZoom] = useState(67);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayImage = canvasImageUrl || sampleImage;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onImageUpload?.(url);
  };

  return (
    <div className="flex-1 flex flex-col studio-surface overflow-hidden relative">
      {/* Canvas rulers / info bar */}
      <div className="h-7 studio-toolbar border-b border-border flex items-center px-3 text-xs text-muted-foreground gap-4">
        <span>1920 × 1080 px</span>
        <span>RGB / 8bit</span>
        <span className="font-mono-code">{zoom}%</span>
        <div className="flex-1" />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
        >
          <Upload className="w-3 h-3" /> Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Main canvas */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden p-4"
        style={{
          background:
            "repeating-conic-gradient(hsl(var(--studio-panel)) 0% 25%, hsl(var(--studio-surface)) 0% 50%) 50% / 20px 20px",
        }}
      >
        {displayImage ? (
          <div
            className="relative shadow-2xl glow-primary rounded-sm overflow-hidden"
            style={{ maxWidth: "90%", maxHeight: "90%" }}
          >
            <img
              src={displayImage}
              alt="Canvas"
              className="block max-w-full max-h-[calc(100vh-280px)] object-contain"
              draggable={false}
            />
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-3 p-12 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer"
          >
            <ImagePlus className="w-12 h-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Import an image or video</p>
              <p className="text-xs text-muted-foreground mt-1">
                Drag & drop or click to browse
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Bottom zoom controls */}
      <div className="h-8 studio-toolbar border-t border-border flex items-center justify-center gap-2">
        <button
          onClick={() => setZoom(Math.max(10, zoom - 10))}
          className="studio-tool-btn w-7 h-7"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <div className="w-24 h-1 rounded-full bg-secondary relative">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(100, zoom)}%` }}
          />
        </div>
        <button
          onClick={() => setZoom(Math.min(400, zoom + 10))}
          className="studio-tool-btn w-7 h-7"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button className="studio-tool-btn w-7 h-7 ml-2">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button className="studio-tool-btn w-7 h-7">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
