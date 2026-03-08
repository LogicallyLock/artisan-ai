import { useState, useEffect, useCallback, useRef } from "react";
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
  const [canvasImageUrl, setCanvasImageUrl] = useState<string | null>(null);

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
      navigate("/dashboard");
      return;
    }

    setProjectName(data.name);
    setMode(data.type as "image" | "video");
    // Restore canvas image from saved data
    const canvasData = data.canvas_data as any;
    if (canvasData?.imageUrl) {
      setCanvasImageUrl(canvasData.imageUrl);
    }
    setLoading(false);
  };

  const handleImageUpload = async (localUrl: string) => {
    // For local preview
    setCanvasImageUrl(localUrl);

    // Upload to storage if user is authenticated
    if (user && projectId) {
      try {
        const response = await fetch(localUrl);
        const blob = await response.blob();
        const ext = blob.type.split("/")[1] || "png";
        const filePath = `${user.id}/${projectId}/canvas.${ext}`;

        const { error } = await supabase.storage
          .from("project-media")
          .upload(filePath, blob, { upsert: true });

        if (error) {
          console.error("Upload error:", error);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("project-media")
          .getPublicUrl(filePath);

        setCanvasImageUrl(urlData.publicUrl);
        toast.success("Image imported!");
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
  };

  const handleAIResult = (imageUrl: string, description: string) => {
    setCanvasImageUrl(imageUrl);
  };

  const saveProject = useCallback(async () => {
    if (!projectId) return;
    const { error } = await supabase
      .from("projects")
      .update({
        name: projectName,
        type: mode,
        canvas_data: { imageUrl: canvasImageUrl },
        layers_data: [],
      })
      .eq("id", projectId);

    if (error) {
      toast.error("Failed to save");
    } else {
      toast.success("Project saved!");
    }
  }, [projectId, projectName, mode, canvasImageUrl]);

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
        onBack={() => navigate("/dashboard")}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <ToolsPanel />

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 flex overflow-hidden relative">
            <CanvasArea
              canvasImageUrl={canvasImageUrl}
              onImageUpload={handleImageUpload}
            />
            <AIPromptBar
              currentImageUrl={canvasImageUrl}
              onAIResult={handleAIResult}
            />
          </div>
          {mode === "video" && <TimelinePanel />}
        </div>

        <LayersPanel />
        <PropertiesPanel />
      </div>
    </div>
  );
}
