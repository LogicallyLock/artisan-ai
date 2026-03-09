import { useState, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Maximize } from "lucide-react";

const presetSizes = [
  { label: "Custom", w: 0, h: 0 },
  { label: "Instagram Post (1080×1080)", w: 1080, h: 1080 },
  { label: "Instagram Story (1080×1920)", w: 1080, h: 1920 },
  { label: "Facebook Cover (820×312)", w: 820, h: 312 },
  { label: "Twitter Banner (1500×500)", w: 1500, h: 500 },
  { label: "YouTube Thumbnail (1280×720)", w: 1280, h: 720 },
  { label: "Poster A4 (2480×3508)", w: 2480, h: 3508 },
  { label: "Business Card (1050×600)", w: 1050, h: 600 },
  { label: "HD (1920×1080)", w: 1920, h: 1080 },
  { label: "4K (3840×2160)", w: 3840, h: 2160 },
];

const bgPresets = [
  "#1a1a2e", "#ffffff", "#000000", "#f5f5f5", "#1e293b",
  "#0f172a", "#fef3c7", "#ecfdf5", "#fce7f3", "transparent",
];

interface CanvasSettingsPanelProps {
  canvasWidth: number;
  canvasHeight: number;
  canvasBg: string;
  onResize: (w: number, h: number) => void;
  onBgChange: (color: string) => void;
}

export function CanvasSettingsPanel({
  canvasWidth,
  canvasHeight,
  canvasBg,
  onResize,
  onBgChange,
}: CanvasSettingsPanelProps) {
  const [width, setWidth] = useState(canvasWidth);
  const [height, setHeight] = useState(canvasHeight);
  const [unit, setUnit] = useState<"px" | "cm" | "in">("px");

  const pxPerCm = 37.8;
  const pxPerIn = 96;

  const toDisplay = (px: number) => {
    if (unit === "cm") return Math.round(px / pxPerCm * 10) / 10;
    if (unit === "in") return Math.round(px / pxPerIn * 10) / 10;
    return px;
  };

  const fromDisplay = (val: number) => {
    if (unit === "cm") return Math.round(val * pxPerCm);
    if (unit === "in") return Math.round(val * pxPerIn);
    return val;
  };

  const applySize = () => {
    onResize(width, height);
  };

  const handlePreset = (label: string) => {
    const preset = presetSizes.find((p) => p.label === label);
    if (preset && preset.w > 0) {
      setWidth(preset.w);
      setHeight(preset.h);
      onResize(preset.w, preset.h);
    }
  };

  return (
    <div className="space-y-3 px-3 py-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Settings className="w-3 h-3" />
        Canvas Settings
      </div>

      {/* Preset sizes */}
      <Select onValueChange={handlePreset}>
        <SelectTrigger className="h-7 text-xs border-border">
          <SelectValue placeholder="Preset sizes..." />
        </SelectTrigger>
        <SelectContent>
          {presetSizes.filter((p) => p.w > 0).map((p) => (
            <SelectItem key={p.label} value={p.label} className="text-xs">
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Unit selector */}
      <div className="flex gap-1">
        {(["px", "cm", "in"] as const).map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase transition-colors ${
              unit === u ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Width/Height */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase">Width</label>
          <input
            type="number"
            value={toDisplay(width)}
            onChange={(e) => {
              const val = Number(e.target.value);
              setWidth(fromDisplay(val));
            }}
            onBlur={applySize}
            className="w-full h-7 px-2 text-xs bg-secondary border border-border rounded text-foreground"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase">Height</label>
          <input
            type="number"
            value={toDisplay(height)}
            onChange={(e) => {
              const val = Number(e.target.value);
              setHeight(fromDisplay(val));
            }}
            onBlur={applySize}
            className="w-full h-7 px-2 text-xs bg-secondary border border-border rounded text-foreground"
          />
        </div>
      </div>

      {/* Background */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-muted-foreground uppercase">Background</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {bgPresets.map((c) => (
            <button
              key={c}
              onClick={() => onBgChange(c)}
              className={`w-5 h-5 rounded border-2 transition-all ${
                canvasBg === c ? "border-primary scale-110" : "border-border"
              }`}
              style={{
                backgroundColor: c === "transparent" ? undefined : c,
                backgroundImage: c === "transparent"
                  ? "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 8px 8px"
                  : undefined,
              }}
              title={c}
            />
          ))}
          <input
            type="color"
            value={canvasBg === "transparent" ? "#ffffff" : canvasBg}
            onChange={(e) => onBgChange(e.target.value)}
            className="w-5 h-5 rounded cursor-pointer border border-border"
          />
        </div>
      </div>
    </div>
  );
}
