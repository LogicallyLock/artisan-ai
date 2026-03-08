import { useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";
import sampleImage from "@/assets/sample-canvas.jpg";

export function CanvasArea() {
  const [zoom, setZoom] = useState(67);

  return (
    <div className="flex-1 flex flex-col studio-surface overflow-hidden relative">
      {/* Canvas rulers / info bar */}
      <div className="h-7 studio-toolbar border-b border-border flex items-center px-3 text-xs text-muted-foreground gap-4">
        <span>1920 × 1080 px</span>
        <span>RGB / 8bit</span>
        <span className="font-mono-code">{zoom}%</span>
      </div>

      {/* Main canvas */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-4"
        style={{ background: "repeating-conic-gradient(hsl(var(--studio-panel)) 0% 25%, hsl(var(--studio-surface)) 0% 50%) 50% / 20px 20px" }}
      >
        <div className="relative shadow-2xl glow-primary rounded-sm overflow-hidden" style={{ maxWidth: "90%", maxHeight: "90%" }}>
          <img
            src={sampleImage}
            alt="Canvas"
            className="block max-w-full max-h-[calc(100vh-280px)] object-contain"
            draggable={false}
          />
          {/* Selection overlay hint */}
          <div className="absolute top-[20%] left-[30%] w-[40%] h-[30%] border border-dashed border-primary/40 rounded-sm pointer-events-none" />
        </div>
      </div>

      {/* Bottom zoom controls */}
      <div className="h-8 studio-toolbar border-t border-border flex items-center justify-center gap-2">
        <button onClick={() => setZoom(Math.max(10, zoom - 10))} className="studio-tool-btn w-7 h-7">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <div className="w-24 h-1 rounded-full bg-secondary relative">
          <div className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, zoom)}%` }} />
        </div>
        <button onClick={() => setZoom(Math.min(400, zoom + 10))} className="studio-tool-btn w-7 h-7">
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
