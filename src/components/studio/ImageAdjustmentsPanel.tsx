import { useState, useCallback, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Sun, Contrast, Droplets, Palette, RotateCcw } from "lucide-react";

interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sharpen: number;
}

const defaultAdj: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  blur: 0,
  sharpen: 0,
};

interface ImageAdjustmentsPanelProps {
  onApplyFilter: (adjustments: Adjustments) => void;
  hasSelection: boolean;
}

export function ImageAdjustmentsPanel({ onApplyFilter, hasSelection }: ImageAdjustmentsPanelProps) {
  const [adj, setAdj] = useState<Adjustments>(defaultAdj);
  const [open, setOpen] = useState(true);

  const update = useCallback(
    (key: keyof Adjustments, value: number) => {
      const next = { ...adj, [key]: value };
      setAdj(next);
      onApplyFilter(next);
    },
    [adj, onApplyFilter]
  );

  const reset = () => {
    setAdj(defaultAdj);
    onApplyFilter(defaultAdj);
  };

  const sliders: { key: keyof Adjustments; label: string; icon: any; min: number; max: number; step: number }[] = [
    { key: "brightness", label: "Brightness", icon: Sun, min: -100, max: 100, step: 1 },
    { key: "contrast", label: "Contrast", icon: Contrast, min: -100, max: 100, step: 1 },
    { key: "saturation", label: "Saturation", icon: Droplets, min: -100, max: 100, step: 1 },
    { key: "hue", label: "Hue Rotate", icon: Palette, min: -180, max: 180, step: 1 },
  ];

  if (!hasSelection) {
    return (
      <div className="px-3 py-4 text-xs text-muted-foreground text-center">
        Select an image layer to adjust
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-3 py-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Adjustments</span>
        <button onClick={reset} className="studio-tool-btn w-6 h-6" title="Reset all">
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-3 px-3 pb-3">
        {sliders.map(({ key, label, icon: Icon, min, max, step }) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Icon className="w-3 h-3" />
                {label}
              </span>
              <span className="font-mono-code w-8 text-right">{adj[key]}</span>
            </div>
            <Slider
              value={[adj[key]]}
              onValueChange={([v]) => update(key, v)}
              min={min}
              max={max}
              step={step}
              className="h-4"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
