import { useState } from "react";
import { Eye, EyeOff, Lock, Unlock, Trash2, Plus, Sparkles, Image, Type, Layers } from "lucide-react";

interface Layer {
  id: string;
  name: string;
  type: "image" | "ai" | "text" | "adjustment";
  visible: boolean;
  locked: boolean;
  opacity: number;
  thumbnail?: string;
}

const initialLayers: Layer[] = [
  { id: "1", name: "AI Sky Replacement", type: "ai", visible: true, locked: false, opacity: 100 },
  { id: "2", name: "Lighting Adjustment", type: "adjustment", visible: true, locked: false, opacity: 85 },
  { id: "3", name: "Text Overlay", type: "text", visible: false, locked: false, opacity: 100 },
  { id: "4", name: "Original Image", type: "image", visible: true, locked: true, opacity: 100 },
];

const typeIcons = {
  image: Image,
  ai: Sparkles,
  text: Type,
  adjustment: Layers,
};

const typeColors = {
  image: "text-foreground",
  ai: "text-primary",
  text: "text-studio-blue",
  adjustment: "text-studio-green",
};

export function LayersPanel() {
  const [layers, setLayers] = useState(initialLayers);
  const [selectedId, setSelectedId] = useState("1");

  const toggleVisibility = (id: string) => {
    setLayers(ls => ls.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const toggleLock = (id: string) => {
    setLayers(ls => ls.map(l => l.id === id ? { ...l, locked: !l.locked } : l));
  };

  return (
    <div className="w-64 studio-panel border-l border-border flex flex-col">
      {/* Header */}
      <div className="h-9 flex items-center justify-between px-3 border-b border-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Layers</span>
        <button className="studio-tool-btn w-6 h-6">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Blend mode + opacity */}
      <div className="px-3 py-2 border-b border-border space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Blend</span>
          <select className="bg-secondary text-foreground text-xs rounded px-2 py-0.5 border-none outline-none">
            <option>Normal</option>
            <option>Multiply</option>
            <option>Screen</option>
            <option>Overlay</option>
            <option>Soft Light</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground w-12">Opacity</span>
          <input
            type="range"
            min="0"
            max="100"
            value={layers.find(l => l.id === selectedId)?.opacity ?? 100}
            className="flex-1 accent-primary h-1"
            onChange={(e) => {
              setLayers(ls => ls.map(l => l.id === selectedId ? { ...l, opacity: Number(e.target.value) } : l));
            }}
          />
          <span className="w-8 text-right font-mono-code">{layers.find(l => l.id === selectedId)?.opacity ?? 100}%</span>
        </div>
      </div>

      {/* Layer list */}
      <div className="flex-1 overflow-y-auto studio-scrollbar">
        {layers.map((layer) => {
          const Icon = typeIcons[layer.type];
          const isSelected = selectedId === layer.id;
          return (
            <div
              key={layer.id}
              onClick={() => setSelectedId(layer.id)}
              className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer border-b border-border/50 transition-colors ${
                isSelected ? "bg-secondary" : "hover:bg-secondary/50"
              }`}
            >
              <button onClick={(e) => { e.stopPropagation(); toggleVisibility(layer.id); }} className="text-muted-foreground hover:text-foreground">
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

              <button onClick={(e) => { e.stopPropagation(); toggleLock(layer.id); }} className="text-muted-foreground hover:text-foreground">
                {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 opacity-30" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom actions */}
      <div className="h-9 flex items-center justify-center gap-1 border-t border-border">
        <button className="studio-tool-btn w-7 h-7"><Plus className="w-3.5 h-3.5" /></button>
        <button className="studio-tool-btn w-7 h-7"><Sparkles className="w-3.5 h-3.5 text-primary" /></button>
        <button className="studio-tool-btn w-7 h-7"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}
