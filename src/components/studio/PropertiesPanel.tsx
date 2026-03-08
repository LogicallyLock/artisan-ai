import { Sun, Contrast, Droplets, Palette, Thermometer, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface Adjustment {
  label: string;
  icon: any;
  value: number;
  min: number;
  max: number;
}

export function PropertiesPanel() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([
    { label: "Brightness", icon: Sun, value: 0, min: -100, max: 100 },
    { label: "Contrast", icon: Contrast, value: 10, min: -100, max: 100 },
    { label: "Saturation", icon: Droplets, value: 15, min: -100, max: 100 },
    { label: "Temperature", icon: Thermometer, value: 5, min: -100, max: 100 },
    { label: "Tint", icon: Palette, value: 0, min: -100, max: 100 },
    { label: "Sharpness", icon: SlidersHorizontal, value: 20, min: 0, max: 100 },
  ]);

  const updateValue = (index: number, val: number) => {
    setAdjustments(prev => prev.map((a, i) => i === index ? { ...a, value: val } : a));
  };

  return (
    <div className="w-56 studio-panel border-l border-border flex flex-col">
      <div className="h-9 flex items-center px-3 border-b border-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Adjustments</span>
      </div>

      <div className="flex-1 overflow-y-auto studio-scrollbar p-3 space-y-3">
        {adjustments.map((adj, i) => (
          <div key={adj.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-secondary-foreground">
                <adj.icon className="w-3.5 h-3.5 text-muted-foreground" />
                {adj.label}
              </div>
              <span className="text-[10px] font-mono-code text-muted-foreground w-8 text-right">
                {adj.value > 0 ? "+" : ""}{adj.value}
              </span>
            </div>
            <input
              type="range"
              min={adj.min}
              max={adj.max}
              value={adj.value}
              onChange={(e) => updateValue(i, Number(e.target.value))}
              className="w-full accent-primary h-1"
            />
          </div>
        ))}
      </div>

      {/* Color info */}
      <div className="px-3 py-2 border-t border-border space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Color</span>
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded bg-primary" />
          <div className="w-8 h-8 rounded bg-foreground" />
        </div>
        <div className="text-[10px] font-mono-code text-muted-foreground">
          R: 230 G: 165 B: 45
        </div>
      </div>
    </div>
  );
}
