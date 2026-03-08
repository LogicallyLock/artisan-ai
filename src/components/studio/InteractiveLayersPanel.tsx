import { Eye, EyeOff, Lock, Unlock, Trash2, Plus, Sparkles, Image, Type, Layers, PenTool } from "lucide-react";
import type { CanvasLayer } from "@/hooks/useFabricCanvas";

const typeIcons: Record<CanvasLayer["type"], any> = {
  image: Image,
  ai: Sparkles,
  text: Type,
  shape: Layers,
  drawing: PenTool,
};

const typeColors: Record<CanvasLayer["type"], string> = {
  image: "text-foreground",
  ai: "text-primary",
  text: "text-blue-400",
  shape: "text-green-400",
  drawing: "text-orange-400",
};

interface InteractiveLayersPanelProps {
  layers: CanvasLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onSetOpacity: (id: string, opacity: number) => void;
  onDelete: () => void;
}

export function InteractiveLayersPanel({
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onSetOpacity,
  onDelete,
}: InteractiveLayersPanelProps) {
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  return (
    <div className="w-64 studio-panel border-l border-border flex flex-col">
      <div className="h-9 flex items-center justify-between px-3 border-b border-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Layers</span>
        <span className="text-[10px] text-muted-foreground">{layers.length} layers</span>
      </div>

      {/* Opacity for selected */}
      {selectedLayer && (
        <div className="px-3 py-2 border-b border-border space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground w-12">Opacity</span>
            <input
              type="range"
              min="0"
              max="100"
              value={selectedLayer.opacity}
              className="flex-1 accent-primary h-1"
              onChange={(e) => onSetOpacity(selectedLayer.id, Number(e.target.value))}
            />
            <span className="w-8 text-right font-mono-code text-muted-foreground">
              {selectedLayer.opacity}%
            </span>
          </div>
        </div>
      )}

      {/* Layer list */}
      <div className="flex-1 overflow-y-auto studio-scrollbar">
        {layers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-xs">
            <Layers className="w-8 h-8 mb-2 opacity-30" />
            <p>No layers yet</p>
            <p className="text-[10px] mt-1">Import an image or use tools to start</p>
          </div>
        )}
        {layers.map((layer) => {
          const Icon = typeIcons[layer.type] || Layers;
          const isSelected = selectedLayerId === layer.id;
          return (
            <div
              key={layer.id}
              onClick={() => onSelectLayer(layer.id)}
              className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer border-b border-border/50 transition-colors ${
                isSelected ? "bg-secondary" : "hover:bg-secondary/50"
              }`}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
                className="text-muted-foreground hover:text-foreground"
              >
                {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              <div className={`w-8 h-8 rounded bg-muted flex items-center justify-center ${typeColors[layer.type]}`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-xs truncate ${isSelected ? "text-foreground" : "text-secondary-foreground"}`}>
                  {layer.name}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize">{layer.type}</p>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); onToggleLock(layer.id); }}
                className="text-muted-foreground hover:text-foreground"
              >
                {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 opacity-30" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom actions */}
      <div className="h-9 flex items-center justify-center gap-1 border-t border-border">
        <button className="studio-tool-btn w-7 h-7" title="Delete selected" onClick={onDelete}>
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
