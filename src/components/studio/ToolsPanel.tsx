import { useState } from "react";
import {
  MousePointer2, Move, Square, Circle, Type, Pen, Eraser,
  Crop, Paintbrush, Pipette, Wand2, Scissors, Hand, ZoomIn,
  Layers, Sparkles, ImagePlus
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const tools = [
  { icon: MousePointer2, label: "Select", shortcut: "V" },
  { icon: Move, label: "Move", shortcut: "M" },
  { icon: Hand, label: "Pan", shortcut: "H" },
  { icon: ZoomIn, label: "Zoom", shortcut: "Z" },
  { divider: true },
  { icon: Crop, label: "Crop", shortcut: "C" },
  { icon: Square, label: "Rectangle", shortcut: "R" },
  { icon: Circle, label: "Ellipse", shortcut: "E" },
  { icon: Type, label: "Text", shortcut: "T" },
  { divider: true },
  { icon: Paintbrush, label: "Brush", shortcut: "B" },
  { icon: Pen, label: "Pen", shortcut: "P" },
  { icon: Eraser, label: "Eraser", shortcut: "X" },
  { icon: Pipette, label: "Color Picker", shortcut: "I" },
  { divider: true },
  { icon: Wand2, label: "Magic Select", shortcut: "W" },
  { icon: Scissors, label: "Cut Out", shortcut: "L" },
  { icon: Sparkles, label: "AI Enhance", shortcut: "A" },
  { icon: ImagePlus, label: "AI Generate", shortcut: "G" },
  { icon: Layers, label: "AI Layers", shortcut: "K" },
] as const;

type Tool = { icon: any; label: string; shortcut: string; divider?: never } | { divider: true };

export function ToolsPanel() {
  const [activeTool, setActiveTool] = useState("Select");

  return (
    <div className="w-12 studio-toolbar flex flex-col items-center py-2 gap-0.5 border-r border-border">
      {(tools as readonly Tool[]).map((tool, i) => {
        if ("divider" in tool && tool.divider) {
          return <div key={i} className="w-6 h-px bg-border my-1.5" />;
        }
        const t = tool as { icon: any; label: string; shortcut: string };
        const isActive = activeTool === t.label;
        return (
          <Tooltip key={t.label} delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setActiveTool(t.label)}
                className={isActive ? "studio-tool-btn-active" : "studio-tool-btn"}
              >
                <t.icon className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {t.label} <span className="text-muted-foreground ml-1">{t.shortcut}</span>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
