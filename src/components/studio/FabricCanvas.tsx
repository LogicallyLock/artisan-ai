import { useEffect, useRef, useCallback } from "react";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Upload } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface FabricCanvasProps {
  onInit: (canvas: HTMLCanvasElement) => void;
  onImageUpload?: (url: string) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function FabricCanvas({
  onInit,
  onImageUpload,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: FabricCanvasProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (canvasElRef.current && !initializedRef.current) {
      initializedRef.current = true;
      onInit(canvasElRef.current);
    }
  }, [onInit]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      onImageUpload?.(url);
      e.target.value = "";
    },
    [onImageUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      onImageUpload?.(url);
    },
    [onImageUpload]
  );

  return (
    <div className="flex-1 flex flex-col studio-surface overflow-hidden relative">
      {/* Top info bar */}
      <div className="h-7 studio-toolbar border-b border-border flex items-center px-3 text-xs text-muted-foreground gap-4">
        <span>Canvas</span>
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

      {/* Canvas area */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{
          background:
            "repeating-conic-gradient(hsl(var(--muted)) 0% 25%, hsl(var(--muted-foreground) / 0.05) 0% 50%) 50% / 20px 20px",
        }}
      >
        <canvas ref={canvasElRef} />
      </div>

      {/* Zoom bar */}
      <div className="h-8 studio-toolbar border-t border-border flex items-center justify-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onZoomOut} className="studio-tool-btn w-7 h-7">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Zoom Out</TooltipContent>
        </Tooltip>
        <div className="w-24 h-1 rounded-full bg-secondary relative">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(100, zoom / 4)}%` }}
          />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onZoomIn} className="studio-tool-btn w-7 h-7">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Zoom In</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onResetZoom} className="studio-tool-btn w-7 h-7 ml-2">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Fit to Screen</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={onResetZoom} className="studio-tool-btn w-7 h-7">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Reset View</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
