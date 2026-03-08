import { Save, Download, Undo2, Redo2, Share2, ArrowLeft, Image, Film, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TopMenuBarProps {
  mode: "image" | "video";
  onModeChange: (mode: "image" | "video") => void;
  projectName?: string;
  onProjectNameChange?: (name: string) => void;
  onSave?: () => void;
  onBack?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onExport?: () => void;
}

export function TopMenuBar({ mode, onModeChange, projectName, onProjectNameChange, onSave, onBack, onUndo, onRedo, canUndo, canRedo, onExport }: TopMenuBarProps) {
  return (
    <div className="h-10 studio-toolbar border-b border-border flex items-center px-3 gap-1">
      {onBack && (
        <button onClick={onBack} className="studio-tool-btn w-8 h-8 mr-1">
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-center gap-2 mr-4">
        <Sparkles className="w-5 h-5 text-primary" />
        {projectName !== undefined && onProjectNameChange ? (
          <input
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            className="text-sm font-semibold text-foreground tracking-tight bg-transparent outline-none border-b border-transparent hover:border-border focus:border-primary w-48"
          />
        ) : (
          <span className="text-sm font-semibold text-foreground tracking-tight">AI Creative Studio</span>
        )}
      </div>

      <div className="flex items-center text-xs text-muted-foreground gap-1">
        {["File", "Edit", "View", "Filter", "Window", "Help"].map(item => (
          <button key={item} className="px-2 py-1 rounded hover:bg-secondary hover:text-foreground transition-colors">
            {item}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-border mx-2" />

      <div className="flex items-center bg-secondary rounded-lg p-0.5 gap-0.5">
        <button
          onClick={() => onModeChange("image")}
          className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs transition-all ${
            mode === "image" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Image className="w-3.5 h-3.5" /> Photo
        </button>
        <button
          onClick={() => onModeChange("video")}
          className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs transition-all ${
            mode === "video" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Film className="w-3.5 h-3.5" /> Video
        </button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-0.5">
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button onClick={onUndo} disabled={!canUndo} className="studio-tool-btn w-8 h-8 disabled:opacity-30">
              <Undo2 className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Undo <span className="text-muted-foreground">⌘Z</span></TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button onClick={onRedo} disabled={!canRedo} className="studio-tool-btn w-8 h-8 disabled:opacity-30">
              <Redo2 className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Redo <span className="text-muted-foreground">⌘⇧Z</span></TooltipContent>
        </Tooltip>
        <div className="w-px h-5 bg-border mx-1" />
        {onSave && (
          <button onClick={onSave} className="studio-tool-btn w-8 h-8"><Save className="w-4 h-4" /></button>
        )}
        <button className="studio-tool-btn w-8 h-8"><Share2 className="w-4 h-4" /></button>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>
    </div>
  );
}
