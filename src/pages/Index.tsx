import { useState } from "react";
import { TopMenuBar } from "@/components/studio/TopMenuBar";
import { ToolsPanel } from "@/components/studio/ToolsPanel";
import { CanvasArea } from "@/components/studio/CanvasArea";
import { LayersPanel } from "@/components/studio/LayersPanel";
import { PropertiesPanel } from "@/components/studio/PropertiesPanel";
import { TimelinePanel } from "@/components/studio/TimelinePanel";
import { AIPromptBar } from "@/components/studio/AIPromptBar";

const Index = () => {
  const [mode, setMode] = useState<"image" | "video">("image");

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopMenuBar mode={mode} onModeChange={setMode} />

      <div className="flex-1 flex overflow-hidden relative">
        <ToolsPanel />

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 flex overflow-hidden relative">
            <CanvasArea />
            <AIPromptBar />
          </div>
          {mode === "video" && <TimelinePanel />}
        </div>

        <LayersPanel />
        <PropertiesPanel />
      </div>
    </div>
  );
};

export default Index;
