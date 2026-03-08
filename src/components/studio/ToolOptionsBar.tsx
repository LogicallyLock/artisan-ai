import { Slider } from "@/components/ui/slider";
import type { ToolType } from "@/hooks/useFabricCanvas";

interface ToolOptionsBarProps {
  activeTool: ToolType;
  brushColor: string;
  brushSize: number;
  onBrushColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  pickedColor: string | null;
}

const presetColors = [
  "#ffffff", "#000000", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280",
];

export function ToolOptionsBar({
  activeTool,
  brushColor,
  brushSize,
  onBrushColorChange,
  onBrushSizeChange,
  pickedColor,
}: ToolOptionsBarProps) {
  const showBrushOptions = ["Brush", "Pen", "Eraser"].includes(activeTool);
  const showColorPicker = activeTool === "Color Picker";
  const showShapeHint = ["Rectangle", "Ellipse"].includes(activeTool);
  const showCropHint = activeTool === "Crop";
  const showZoomHint = activeTool === "Zoom";
  const showAIHint = ["AI Enhance", "AI Generate", "AI Layers", "Magic Select", "Cut Out"].includes(activeTool);

  if (!showBrushOptions && !showColorPicker && !showShapeHint && !showCropHint && !showZoomHint && !showAIHint) {
    return null;
  }

  return (
    <div className="h-9 studio-toolbar border-b border-border flex items-center px-3 gap-3 text-xs text-muted-foreground">
      {showBrushOptions && (
        <>
          <span className="text-foreground font-medium">{activeTool}</span>
          <div className="w-px h-4 bg-border" />
          <span>Size</span>
          <div className="w-24">
            <Slider
              value={[brushSize]}
              onValueChange={([v]) => onBrushSizeChange(v)}
              min={1}
              max={50}
              step={1}
              className="h-4"
            />
          </div>
          <span className="font-mono w-6 text-right">{brushSize}px</span>
          <div className="w-px h-4 bg-border" />
          <span>Color</span>
          <div className="flex gap-1">
            {presetColors.map((c) => (
              <button
                key={c}
                onClick={() => onBrushColorChange(c)}
                className={`w-5 h-5 rounded-full border-2 transition-all ${
                  brushColor === c ? "border-primary scale-110" : "border-border"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input
            type="color"
            value={brushColor}
            onChange={(e) => onBrushColorChange(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer border border-border"
          />
        </>
      )}

      {showColorPicker && (
        <>
          <span className="text-foreground font-medium">Color Picker</span>
          <div className="w-px h-4 bg-border" />
          <span>Click on canvas to sample color</span>
          {pickedColor && (
            <>
              <div
                className="w-6 h-6 rounded border border-border"
                style={{ backgroundColor: pickedColor }}
              />
              <span className="font-mono">{pickedColor}</span>
            </>
          )}
        </>
      )}

      {showShapeHint && (
        <>
          <span className="text-foreground font-medium">{activeTool}</span>
          <div className="w-px h-4 bg-border" />
          <span>Click & drag on canvas to draw. Click without dragging for default size.</span>
        </>
      )}

      {showCropHint && (
        <>
          <span className="text-foreground font-medium">Crop</span>
          <div className="w-px h-4 bg-border" />
          <span>Click & drag to select crop region. Release to apply.</span>
        </>
      )}

      {showZoomHint && (
        <>
          <span className="text-foreground font-medium">Zoom</span>
          <div className="w-px h-4 bg-border" />
          <span>Click to zoom in. Alt+Click to zoom out. Scroll wheel also works.</span>
        </>
      )}

      {showAIHint && (
        <>
          <span className="text-foreground font-medium">{activeTool}</span>
          <div className="w-px h-4 bg-border" />
          <span>Use the AI prompt bar below to describe your edit.</span>
        </>
      )}
    </div>
  );
}
