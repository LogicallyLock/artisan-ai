import {
  MousePointer2, Move, Square, Circle, Type, Pen, Eraser,
  Crop, Paintbrush, Pipette, Wand2, Scissors, Hand, ZoomIn,
  Layers, Sparkles, ImagePlus, Trash2
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ToolType } from "@/hooks/useFabricCanvas";

const tools: ({ icon: any; label: ToolType; shortcut: string } | { divider: true })[] = [
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
];

interface InteractiveToolsPanelProps {
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
  onDelete: () => void;
}

export function InteractiveToolsPanel({ activeTool, onToolSelect, onDelete }: InteractiveToolsPanelProps) {
  return (
    <div className="w-12 studio-toolbar flex flex-col items-center py-2 gap-0.5 border-r border-border">
      {tools.map((tool, i) => {
        if ("divider" in tool) {
          return <div key={i} className="w-6 h-px bg-border my-1.5" />;
        }
        const isActive = activeTool === tool.label;
        return (
          <Tooltip key={tool.label} delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onToolSelect(tool.label)}
                className={isActive ? "studio-tool-btn-active" : "studio-tool-btn"}
              >
                <tool.icon className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {tool.label} <span className="text-muted-foreground ml-1">{tool.shortcut}</span>
            </TooltipContent>
          </Tooltip>
        );
      })}
      <div className="w-6 h-px bg-border my-1.5" />
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button onClick={onDelete} className="studio-tool-btn text-destructive">
            <Trash2 className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          Delete <span className="text-muted-foreground ml-1">Del</span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
