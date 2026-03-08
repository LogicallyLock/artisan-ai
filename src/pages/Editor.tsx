import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TopMenuBar } from "@/components/studio/TopMenuBar";
import { ToolsPanel } from "@/components/studio/ToolsPanel";
import { CanvasArea } from "@/components/studio/CanvasArea";
import { LayersPanel } from "@/components/studio/LayersPanel";
import { PropertiesPanel } from "@/components/studio/PropertiesPanel";
import { TimelinePanel } from "@/components/studio/TimelinePanel";
import { AIPromptBar } from "@/components/studio/AIPromptBar";
import { toast } from "sonner";

export default function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"image" | "video">("image");
  const [projectName, setProjectName] = useState("Untitled Project");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId!)
      .single();

    if (error || !data) {
      toast.error("Project not found");
      navigate("/");
      return;
    }

    setProjectName(data.name);
    setMode(data.type as "image" | "video");
    setLoading(false);
  };

  const saveProject = useCallback(async () => {
    if (!projectId) return;
    const { error } = await supabase
      .from("projects")
      .update({
        name: projectName,
        type: mode,
        canvas_data: {},
        layers_data: [],
      })
      .eq("id", projectId);

    if (error) {
      toast.error("Failed to save");
    } else {
      toast.success("Project saved!");
    }
  }, [projectId, projectName, mode]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center studio-surface text-muted-foreground">
        Loading project...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopMenuBar
        mode={mode}
        onModeChange={setMode}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onSave={saveProject}
        onBack={() => navigate("/")}
      />

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
}
