import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TopMenuBar } from "@/components/studio/TopMenuBar";
import { InteractiveToolsPanel } from "@/components/studio/InteractiveToolsPanel";
import { FabricCanvas } from "@/components/studio/FabricCanvas";
import { InteractiveLayersPanel } from "@/components/studio/InteractiveLayersPanel";
import { TimelinePanel } from "@/components/studio/TimelinePanel";
import { AIPromptBar } from "@/components/studio/AIPromptBar";
import { ToolOptionsBar } from "@/components/studio/ToolOptionsBar";
import { ExportDialog } from "@/components/studio/ExportDialog";
import { ShareDialog } from "@/components/studio/ShareDialog";
import { useRealtimeCollaboration, CollaboratorAvatars } from "@/components/studio/RealtimeCollaboration";
import { useFabricCanvas } from "@/hooks/useFabricCanvas";
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

  const {
    initCanvas,
    layers,
    activeTool,
    setActiveTool,
    selectedLayerId,
    selectLayer,
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    addImageFromUrl,
    addAIImage,
    deleteSelected,
    toggleLayerVisibility,
    toggleLayerLock,
    setLayerOpacity,
    exportCanvasAsDataUrl,
    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize,
    pickedColor,
    undo,
    redo,
    canUndo,
    canRedo,
    setSelectedFill,
    setSelectedStroke,
    getSelectedObjectProps,
  } = useFabricCanvas();

  const { onlineUsers } = useRealtimeCollaboration(projectId);

  useEffect(() => {
    if (!projectId) return;
    loadProject();
  }, [projectId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelected();
        return;
      }

      const shortcuts: Record<string, () => void> = {
        v: () => setActiveTool("Select"),
        m: () => setActiveTool("Move"),
        h: () => setActiveTool("Pan"),
        t: () => setActiveTool("Text"),
        r: () => setActiveTool("Rectangle"),
        e: () => setActiveTool("Ellipse"),
        b: () => setActiveTool("Brush"),
        x: () => setActiveTool("Eraser"),
      };

      if (!e.metaKey && !e.ctrlKey && shortcuts[e.key.toLowerCase()]) {
        e.preventDefault();
        shortcuts[e.key.toLowerCase()]();
      }

      // Ctrl+Z / Ctrl+Shift+Z for undo/redo
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }

      // Ctrl+S to save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveProject();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [deleteSelected, setActiveTool, undo, redo]);

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
    setLoading(false);

    // Load saved image into canvas after init
    const canvasData = data.canvas_data as any;
    if (canvasData?.imageUrl) {
      // Delay to let canvas initialize
      setTimeout(() => {
        addImageFromUrl(canvasData.imageUrl, "Saved Image");
      }, 500);
    }
  };

  const handleImageUpload = async (localUrl: string) => {
    await addImageFromUrl(localUrl, "Imported Image");

    if (user && projectId) {
      try {
        const response = await fetch(localUrl);
        const blob = await response.blob();
        const ext = blob.type.split("/")[1] || "png";
        const filePath = `${user.id}/${projectId}/upload-${Date.now()}.${ext}`;

        const { error } = await supabase.storage
          .from("project-media")
          .upload(filePath, blob, { upsert: true });

        if (error) { console.error("Upload error:", error); return; }

        toast.success("Image imported!");
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
  };

  const handleAIResult = async (imageUrl: string, description: string) => {
    await addAIImage(imageUrl, description);
    toast.success("AI result added as editable layer!");
  };

  const saveProject = useCallback(async () => {
    if (!projectId) return;
    const canvasDataUrl = exportCanvasAsDataUrl();
    const { error } = await supabase
      .from("projects")
      .update({
        name: projectName,
        type: mode,
        canvas_data: { imageUrl: canvasDataUrl },
        layers_data: [],
      })
      .eq("id", projectId);

    if (error) { toast.error("Failed to save"); }
    else { toast.success("Project saved!"); }
  }, [projectId, projectName, mode, exportCanvasAsDataUrl]);

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
        <InteractiveToolsPanel
          activeTool={activeTool}
          onToolSelect={setActiveTool}
          onDelete={deleteSelected}
        />

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <ToolOptionsBar
            activeTool={activeTool}
            brushColor={brushColor}
            brushSize={brushSize}
            onBrushColorChange={setBrushColor}
            onBrushSizeChange={setBrushSize}
            pickedColor={pickedColor}
            selectedLayerId={selectedLayerId}
            onFillChange={setSelectedFill}
            onStrokeChange={setSelectedStroke}
            getSelectedObjectProps={getSelectedObjectProps}
          />
          <div className="flex-1 flex overflow-hidden relative">
            <FabricCanvas
              onInit={initCanvas}
              onImageUpload={handleImageUpload}
              zoom={zoom}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onResetZoom={resetZoom}
            />
            <AIPromptBar
              currentImageUrl={exportCanvasAsDataUrl()}
              onAIResult={handleAIResult}
            />
          </div>
          {mode === "video" && <TimelinePanel />}
        </div>

        <InteractiveLayersPanel
          layers={layers}
          selectedLayerId={selectedLayerId}
          onSelectLayer={selectLayer}
          onToggleVisibility={toggleLayerVisibility}
          onToggleLock={toggleLayerLock}
          onSetOpacity={setLayerOpacity}
          onDelete={deleteSelected}
        />
      </div>

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        imageUrl={exportCanvasAsDataUrl()}
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
