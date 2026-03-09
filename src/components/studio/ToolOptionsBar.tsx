import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ToolType } from "@/hooks/useFabricCanvas";

const fontOptions = [
  "Arial", "Helvetica", "Georgia", "Times New Roman", "Courier New",
  "Verdana", "Trebuchet MS", "Impact", "Comic Sans MS", "Palatino",
];

interface ToolOptionsBarProps {
  activeTool: ToolType;
  brushColor: string;
  brushSize: number;
  brushType: "round" | "square" | "spray";
  onBrushColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onBrushTypeChange: (type: "round" | "square" | "spray") => void;
  pickedColor: string | null;
  selectedLayerId: string | null;
  onFillChange: (color: string) => void;
  onStrokeChange: (color: string) => void;
  onFontFamilyChange: (font: string) => void;
  onFontSizeChange: (size: number) => void;
  getSelectedObjectProps: () => { fill: string | null; stroke: string | null; isText: boolean; isImage: boolean; fontFamily: string | null; fontSize: number | null } | null;
}

const presetColors = [
  "#ffffff", "#000000", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280",
];

const brushTypes: { value: "round" | "square" | "spray"; label: string }[] = [
  { value: "round", label: "Round" },
  { value: "spray", label: "Spray" },
];

export function ToolOptionsBar({
  activeTool,
  brushColor,
  brushSize,
  brushType,
  onBrushColorChange,
  onBrushSizeChange,
  onBrushTypeChange,
  pickedColor,
  selectedLayerId,
  onFillChange,
  onStrokeChange,
  onFontFamilyChange,
  onFontSizeChange,
  getSelectedObjectProps,
}: ToolOptionsBarProps) {
  const showBrushOptions = ["Brush", "Pen", "Eraser"].includes(activeTool);
  const showColorPicker = activeTool === "Color Picker";
  const showShapeHint = ["Rectangle", "Ellipse"].includes(activeTool);
  const showCropHint = activeTool === "Crop";
  const showZoomHint = activeTool === "Zoom";
  const showAIHint = ["AI Enhance", "AI Generate", "AI Layers", "Magic Select", "Cut Out"].includes(activeTool);

  const [fillColor, setFillColor] = useState<string>("#8b5cf6");
  const [strokeColor, setStrokeColor] = useState<string>("#8b5cf6");
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [fontSize, setFontSize] = useState<number>(24);
  const [isTextObj, setIsTextObj] = useState(false);

  useEffect(() => {
    const props = getSelectedObjectProps();
    if (props) {
      if (props.fill) setFillColor(props.fill);
      if (props.stroke) setStrokeColor(props.stroke);
      setIsTextObj(props.isText);
      if (props.fontFamily) setFontFamily(props.fontFamily);
      if (props.fontSize) setFontSize(props.fontSize);
    } else {
      setIsTextObj(false);
    }
  }, [selectedLayerId, getSelectedObjectProps]);

  const showObjectProps = activeTool === "Select" && selectedLayerId;

  if (!showBrushOptions && !showColorPicker && !showShapeHint && !showCropHint && !showZoomHint && !showAIHint && !showObjectProps) {
    return null;
  }

  return (
    <div className="h-9 studio-toolbar border-b border-border flex items-center px-3 gap-3 text-xs text-muted-foreground overflow-x-auto">
      {showObjectProps && (
        <>
          <span className="text-foreground font-medium">Selection</span>
          <div className="w-px h-4 bg-border" />
          <span>Fill</span>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={fillColor}
              onChange={(e) => { setFillColor(e.target.value); onFillChange(e.target.value); }}
              className="w-6 h-6 rounded cursor-pointer border border-border"
            />
            <span className="font-mono w-16">{fillColor}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <span>Stroke</span>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => { setStrokeColor(e.target.value); onStrokeChange(e.target.value); }}
              className="w-6 h-6 rounded cursor-pointer border border-border"
            />
            <span className="font-mono w-16">{strokeColor}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex gap-1">
            {presetColors.slice(0, 6).map((c) => (
              <button
                key={c}
                onClick={() => { setFillColor(c); onFillChange(c); }}
                className="w-4 h-4 rounded-full border border-border hover:scale-125 transition-transform"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          {isTextObj && (
            <>
              <div className="w-px h-4 bg-border" />
              <span>Font</span>
              <Select value={fontFamily} onValueChange={(v) => { setFontFamily(v); onFontFamilyChange(v); }}>
                <SelectTrigger className="h-6 w-32 text-xs border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((f) => (
                    <SelectItem key={f} value={f} className="text-xs" style={{ fontFamily: f }}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="w-px h-4 bg-border" />
              <span>Size</span>
              <div className="w-20">
                <Slider
                  value={[fontSize]}
                  onValueChange={([v]) => { setFontSize(v); onFontSizeChange(v); }}
                  min={8}
                  max={120}
                  step={1}
                  className="h-4"
                />
              </div>
              <span className="font-mono w-8 text-right">{fontSize}px</span>
            </>
          )}
        </>
      )}

      {showBrushOptions && (
        <>
          <span className="text-foreground font-medium">{activeTool}</span>
          <div className="w-px h-4 bg-border" />
          {activeTool === "Brush" && (
            <>
              <span>Type</span>
              <div className="flex gap-1">
                {brushTypes.map((bt) => (
                  <button
                    key={bt.value}
                    onClick={() => onBrushTypeChange(bt.value)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      brushType === bt.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {bt.label}
                  </button>
                ))}
              </div>
              <div className="w-px h-4 bg-border" />
            </>
          )}
          <span>Size</span>
          <div className="w-24">
            <Slider
              value={[brushSize]}
              onValueChange={([v]) => onBrushSizeChange(v)}
              min={1}
              max={80}
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
          {/* Brush cursor preview */}
          <div className="w-px h-4 bg-border" />
          <div
            className="rounded-full border border-muted-foreground"
            style={{
              width: Math.min(30, brushSize),
              height: Math.min(30, brushSize),
              backgroundColor: brushColor,
              minWidth: 4,
              minHeight: 4,
            }}
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
              <div className="w-6 h-6 rounded border border-border" style={{ backgroundColor: pickedColor }} />
              <span className="font-mono">{pickedColor}</span>
            </>
          )}
        </>
      )}

      {showShapeHint && (
        <>
          <span className="text-foreground font-medium">{activeTool}</span>
          <div className="w-px h-4 bg-border" />
          <span>Click & drag to draw. Click for default size. Hold Shift for proportional.</span>
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
