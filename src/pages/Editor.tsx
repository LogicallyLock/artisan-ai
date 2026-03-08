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
import { FiltersPanel, FilterState, DEFAULT_FILTERS } from "@/components/studio/FiltersPanel";
import { ExportDialog } from "@/components/studio/ExportDialog";
import { ShareDialog } from "@/components/studio/ShareDialog";
import { useRealtimeCollaboration, CollaboratorAvatars } from "@/components/studio/RealtimeCollaboration";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { toast } from "sonner";

export default function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"image" | "video">("image");
  const [projectName, setProjectName] = useState("Untitled Project");
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const { current: canvasImageUrl, push: pushImage, undo, redo, canUndo, canRedo } = useUndoRedo<string | null>(null);
  const { onlineUsers } = useRealtimeCollaboration(projectId);

  // Listen for realtime project updates from collaborators
  useEffect(() => {
    if (!projectId) return;
    const channel = supabase
      .channel(`project-sync:${projectId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "projects", filter: `id=eq.${projectId}` },
        (payload) => {
          const updated = payload.new as any;
          // Only apply changes from other users
          if (updated.canvas_data?.imageUrl && updated.canvas_data.imageUrl !== canvasImageUrl) {
            pushImage(updated.canvas_data.imageUrl);
          }
          if (updated.name !== projectName) {
            setProjectName(updated.name);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    loadProject();
  }, [projectId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) { redo(); } else { undo(); }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

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
    const canvasData = data.canvas_data as any;
    if (canvasData?.imageUrl) {
      pushImage(canvasData.imageUrl);
    }
    if (canvasData?.filters) {
      setFilters({ ...DEFAULT_FILTERS, ...canvasData.filters });
    }
    setLoading(false);
  };

  const handleImageUpload = async (localUrl: string) => {
    pushImage(localUrl);

    if (user && projectId) {
      try {
        const response = await fetch(localUrl);
        const blob = await response.blob();
        const ext = blob.type.split("/")[1] || "png";
        const filePath = `${user.id}/${projectId}/canvas.${ext}`;

        const { error } = await supabase.storage
          .from("project-media")
          .upload(filePath, blob, { upsert: true });

        if (error) { console.error("Upload error:", error); return; }

        const { data: urlData } = supabase.storage
          .from("project-media")
          .getPublicUrl(filePath);

        pushImage(urlData.publicUrl);
        toast.success("Image imported!");
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
  };

  const handleAIResult = (imageUrl: string) => {
    pushImage(imageUrl);
  };

  const saveProject = useCallback(async () => {
    if (!projectId) return;
    const { error } = await supabase
      .from("projects")
      .update({
        name: projectName,
        type: mode,
        canvas_data: { imageUrl: canvasImageUrl, filters: filters as unknown as Record<string, number> },
        layers_data: [],
      })
      .eq("id", projectId);

    if (error) { toast.error("Failed to save"); }
    else { toast.success("Project saved!"); }
  }, [projectId, projectName, mode, canvasImageUrl, filters]);

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
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onExport={() => setExportOpen(true)}
        onShare={() => setShareOpen(true)}
        collaborators={<CollaboratorAvatars users={onlineUsers} />}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <ToolsPanel />

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 flex overflow-hidden relative">
            <CanvasArea
              canvasImageUrl={canvasImageUrl}
              onImageUpload={handleImageUpload}
              filters={filters}
            />
            <AIPromptBar
              currentImageUrl={canvasImageUrl}
              onAIResult={handleAIResult}
            />
          </div>
          {mode === "video" && <TimelinePanel />}
        </div>

        <div className="flex flex-col border-l border-border">
          <FiltersPanel filters={filters} onFiltersChange={setFilters} />
        </div>
        <PropertiesPanel />
      </div>

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        imageUrl={canvasImageUrl}
        mode={mode}
      />
      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        projectId={projectId || ""}
        projectName={projectName}
      />
    </div>
  );
}
