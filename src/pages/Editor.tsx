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
import { ImageAdjustmentsPanel } from "@/components/studio/ImageAdjustmentsPanel";
import { CanvasSettingsPanel } from "@/components/studio/CanvasSettingsPanel";
import { useRealtimeCollaboration, CollaboratorAvatars } from "@/components/studio/RealtimeCollaboration";
import { useFabricCanvas } from "@/hooks/useFabricCanvas";
import { useVideoEngine } from "@/hooks/useVideoEngine";
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
  const [rightTab, setRightTab] = useState<"layers" | "adjustments" | "settings">("layers");

  const fabric = useFabricCanvas();
  const videoEngine = useVideoEngine();
  const { onlineUsers } = useRealtimeCollaboration(projectId);

  useEffect(() => {
    if (!projectId) return;
    loadProject();
  }, [projectId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      if (e.metaKey || e.ctrlKey) {
        if (e.key.toLowerCase() === "z") {
          e.preventDefault();
          if (e.shiftKey) fabric.redo();
          else fabric.undo();
          return;
        }
        if (e.key.toLowerCase() === "s") {
          e.preventDefault();
          saveProject();
          return;
        }
        return;
      }

      if (isInput) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        fabric.deleteSelected();
        return;
      }

      const shortcuts: Record<string, () => void> = {
        v: () => fabric.setActiveTool("Select"),
        m: () => fabric.setActiveTool("Move"),
        h: () => fabric.setActiveTool("Pan"),
        z: () => fabric.setActiveTool("Zoom"),
        c: () => fabric.setActiveTool("Crop"),
        t: () => fabric.setActiveTool("Text"),
        r: () => fabric.setActiveTool("Rectangle"),
        e: () => fabric.setActiveTool("Ellipse"),
        b: () => fabric.setActiveTool("Brush"),
        p: () => fabric.setActiveTool("Pen"),
        x: () => fabric.setActiveTool("Eraser"),
        i: () => fabric.setActiveTool("Color Picker"),
        w: () => fabric.setActiveTool("Magic Select"),
        l: () => fabric.setActiveTool("Cut Out"),
        a: () => fabric.setActiveTool("AI Enhance"),
        g: () => fabric.setActiveTool("AI Generate"),
        k: () => fabric.setActiveTool("AI Layers"),
      };

      if (shortcuts[e.key.toLowerCase()]) {
        e.preventDefault();
        shortcuts[e.key.toLowerCase()]();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fabric.deleteSelected, fabric.setActiveTool, fabric.undo, fabric.redo]);

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

    const canvasData = data.canvas_data as any;
    if (canvasData?.imageUrl) {
      setTimeout(() => {
        fabric.addImageFromUrl(canvasData.imageUrl, "Saved Image");
      }, 500);
    }
  };

  const handleImageUpload = async (localUrl: string) => {
    await fabric.addImageFromUrl(localUrl, "Imported Image");

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
    await fabric.addAIImage(imageUrl, description);
    toast.success("AI result added as editable layer!");
  };

  const saveProject = useCallback(async () => {
    if (!projectId) return;
    const canvasDataUrl = fabric.exportCanvasAsDataUrl();
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
  }, [projectId, projectName, mode, fabric.exportCanvasAsDataUrl]);

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
        onUndo={fabric.undo}
        onRedo={fabric.redo}
        canUndo={fabric.canUndo}
        canRedo={fabric.canRedo}
        onExport={() => setExportOpen(true)}
        onShare={() => setShareOpen(true)}
        collaborators={<CollaboratorAvatars users={onlineUsers} />}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <InteractiveToolsPanel
          activeTool={fabric.activeTool}
          onToolSelect={fabric.setActiveTool}
          onDelete={fabric.deleteSelected}
        />

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <ToolOptionsBar
            activeTool={fabric.activeTool}
            brushColor={fabric.brushColor}
            brushSize={fabric.brushSize}
            brushType={fabric.brushType}
            onBrushColorChange={fabric.setBrushColor}
            onBrushSizeChange={fabric.setBrushSize}
            onBrushTypeChange={fabric.setBrushType}
            pickedColor={fabric.pickedColor}
            selectedLayerId={fabric.selectedLayerId}
            onFillChange={fabric.setSelectedFill}
            onStrokeChange={fabric.setSelectedStroke}
            onFontFamilyChange={fabric.setSelectedFontFamily}
            onFontSizeChange={fabric.setSelectedFontSize}
            getSelectedObjectProps={fabric.getSelectedObjectProps}
          />
          <div className="flex-1 flex overflow-hidden relative">
            <FabricCanvas
              onInit={fabric.initCanvas}
              onImageUpload={handleImageUpload}
              zoom={fabric.zoom}
              onZoomIn={fabric.zoomIn}
              onZoomOut={fabric.zoomOut}
              onResetZoom={fabric.resetZoom}
            />
            <AIPromptBar
              currentImageUrl={fabric.exportCanvasAsDataUrl()}
              onAIResult={handleAIResult}
            />
          </div>
          {mode === "video" && <TimelinePanel engine={videoEngine} />}
        </div>

        {/* Right panel with tabs */}
        <div className="w-64 studio-panel border-l border-border flex flex-col">
          {/* Tab bar */}
          <div className="h-8 flex items-center border-b border-border px-1 gap-0.5">
            {(["layers", "adjustments", "settings"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wide transition-colors ${
                  rightTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {rightTab === "layers" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <InteractiveLayersPanel
                layers={fabric.layers}
                selectedLayerId={fabric.selectedLayerId}
                onSelectLayer={fabric.selectLayer}
                onToggleVisibility={fabric.toggleLayerVisibility}
                onToggleLock={fabric.toggleLayerLock}
                onSetOpacity={fabric.setLayerOpacity}
                onDelete={fabric.deleteSelected}
                onDuplicate={fabric.duplicateLayer}
                onMoveUp={fabric.moveLayerUp}
                onMoveDown={fabric.moveLayerDown}
              />
            </div>
          )}

          {rightTab === "adjustments" && (
            <div className="flex-1 overflow-y-auto studio-scrollbar">
              <ImageAdjustmentsPanel
                onApplyFilter={fabric.applyImageAdjustments}
                hasSelection={!!fabric.selectedLayerId}
              />
            </div>
          )}

          {rightTab === "settings" && (
            <div className="flex-1 overflow-y-auto studio-scrollbar">
              <CanvasSettingsPanel
                canvasWidth={fabric.canvasWidth}
                canvasHeight={fabric.canvasHeight}
                canvasBg={fabric.canvasBg}
                onResize={fabric.resizeCanvas}
                onBgChange={fabric.changeCanvasBg}
              />
            </div>
          )}
        </div>
      </div>

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        imageUrl={fabric.exportCanvasAsDataUrl()}
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
