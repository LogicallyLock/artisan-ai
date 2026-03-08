import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export interface FilterState {
  blur: number;
  vignette: number;
  grain: number;
  brightness: number;
  contrast: number;
  saturate: number;
  sepia: number;
  hueRotate: number;
}

export const DEFAULT_FILTERS: FilterState = {
  blur: 0,
  vignette: 0,
  grain: 0,
  brightness: 100,
  contrast: 100,
  saturate: 100,
  sepia: 0,
  hueRotate: 0,
};

const PRESETS: { name: string; filters: Partial<FilterState> }[] = [
  { name: "None", filters: {} },
  { name: "Vintage", filters: { sepia: 60, saturate: 80, contrast: 110, brightness: 95, grain: 30 } },
  { name: "Cinematic", filters: { contrast: 130, saturate: 85, brightness: 90, vignette: 50, hueRotate: -10 } },
  { name: "B&W", filters: { saturate: 0, contrast: 120 } },
  { name: "Warm", filters: { sepia: 25, saturate: 120, brightness: 105, hueRotate: 10 } },
  { name: "Cool", filters: { saturate: 90, brightness: 100, hueRotate: 190, contrast: 105 } },
  { name: "Dreamy", filters: { blur: 1, brightness: 110, saturate: 120, contrast: 90 } },
  { name: "High Key", filters: { brightness: 130, contrast: 85, saturate: 90 } },
];

const SLIDERS: { key: keyof FilterState; label: string; min: number; max: number; unit?: string }[] = [
  { key: "brightness", label: "Brightness", min: 50, max: 150, unit: "%" },
  { key: "contrast", label: "Contrast", min: 50, max: 200, unit: "%" },
  { key: "saturate", label: "Saturation", min: 0, max: 200, unit: "%" },
  { key: "sepia", label: "Sepia", min: 0, max: 100, unit: "%" },
  { key: "hueRotate", label: "Hue Shift", min: -180, max: 180, unit: "°" },
  { key: "blur", label: "Blur", min: 0, max: 10 },
  { key: "vignette", label: "Vignette", min: 0, max: 100 },
  { key: "grain", label: "Grain", min: 0, max: 100 },
];

interface FiltersPanelProps {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
}

export function FiltersPanel({ filters, onFiltersChange }: FiltersPanelProps) {
  const [activePreset, setActivePreset] = useState("None");

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setActivePreset(preset.name);
    onFiltersChange({ ...DEFAULT_FILTERS, ...preset.filters });
  };

  const updateFilter = (key: keyof FilterState, value: number) => {
    setActivePreset("");
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="w-56 studio-panel border-l border-border flex flex-col">
      <div className="h-9 flex items-center px-3 border-b border-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filters & Presets</span>
      </div>

      {/* Presets grid */}
      <div className="px-3 pt-3 pb-1">
        <div className="grid grid-cols-4 gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className={`py-1.5 rounded text-[10px] font-medium transition-all ${
                activePreset === p.name
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="flex-1 overflow-y-auto studio-scrollbar p-3 space-y-3">
        {SLIDERS.map((s) => (
          <div key={s.key} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary-foreground">{s.label}</span>
              <span className="text-[10px] font-mono-code text-muted-foreground w-10 text-right">
                {Math.round(filters[s.key])}{s.unit || ""}
              </span>
            </div>
            <Slider
              value={[filters[s.key]]}
              onValueChange={([v]) => updateFilter(s.key, v)}
              min={s.min}
              max={s.max}
              step={1}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* Reset */}
      <div className="px-3 py-2 border-t border-border">
        <button
          onClick={() => { applyPreset(PRESETS[0]); }}
          className="w-full py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
}

/** Build a CSS filter string from FilterState */
export function buildCSSFilter(f: FilterState): string {
  const parts: string[] = [];
  if (f.brightness !== 100) parts.push(`brightness(${f.brightness}%)`);
  if (f.contrast !== 100) parts.push(`contrast(${f.contrast}%)`);
  if (f.saturate !== 100) parts.push(`saturate(${f.saturate}%)`);
  if (f.sepia > 0) parts.push(`sepia(${f.sepia}%)`);
  if (f.hueRotate !== 0) parts.push(`hue-rotate(${f.hueRotate}deg)`);
  if (f.blur > 0) parts.push(`blur(${f.blur}px)`);
  return parts.length > 0 ? parts.join(" ") : "none";
}
