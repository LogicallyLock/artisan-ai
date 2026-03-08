import { useRef, useState, useCallback, useEffect } from "react";
import * as fabric from "fabric";

export interface CanvasLayer {
  id: string;
  name: string;
  type: "image" | "ai" | "text" | "shape" | "drawing";
  visible: boolean;
  locked: boolean;
  opacity: number;
  fabricObject?: fabric.FabricObject;
}

export type ToolType =
  | "Select" | "Move" | "Pan" | "Zoom"
  | "Crop" | "Rectangle" | "Ellipse" | "Text"
  | "Brush" | "Pen" | "Eraser" | "Color Picker"
  | "Magic Select" | "Cut Out" | "AI Enhance" | "AI Generate" | "AI Layers";

export function useFabricCanvas() {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [layers, setLayers] = useState<CanvasLayer[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType>("Select");
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [brushColor, setBrushColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(5);
  const layerCountRef = useRef(0);
  const isPanningRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const initCanvas = useCallback((canvasEl: HTMLCanvasElement) => {
    if (canvasRef.current) {
      canvasRef.current.dispose();
    }

    const canvas = new fabric.Canvas(canvasEl, {
      width: 1200,
      height: 700,
      backgroundColor: "#1a1a2e",
      selection: true,
      preserveObjectStacking: true,
    });

    canvasRef.current = canvas;

    canvas.on("selection:created", (e) => {
      const obj = e.selected?.[0];
      if (obj) {
        const layerId = (obj as any).__layerId;
        if (layerId) setSelectedLayerId(layerId);
      }
    });

    canvas.on("selection:updated", (e) => {
      const obj = e.selected?.[0];
      if (obj) {
        const layerId = (obj as any).__layerId;
        if (layerId) setSelectedLayerId(layerId);
      }
    });

    canvas.on("selection:cleared", () => {
      setSelectedLayerId(null);
    });

    // Panning support
    canvas.on("mouse:down", (opt) => {
      if (activeTool === "Pan") {
        isPanningRef.current = true;
        const evt = opt.e as MouseEvent;
        lastPosRef.current = { x: evt.clientX, y: evt.clientY };
        canvas.selection = false;
      }
    });

    canvas.on("mouse:move", (opt) => {
      if (isPanningRef.current && lastPosRef.current) {
        const evt = opt.e as MouseEvent;
        const vpt = canvas.viewportTransform!;
        vpt[4] += evt.clientX - lastPosRef.current.x;
        vpt[5] += evt.clientY - lastPosRef.current.y;
        canvas.requestRenderAll();
        lastPosRef.current = { x: evt.clientX, y: evt.clientY };
      }
    });

    canvas.on("mouse:up", () => {
      isPanningRef.current = false;
      lastPosRef.current = null;
      if (activeTool !== "Pan") {
        canvas.selection = true;
      }
    });

    // Zoom with scroll
    canvas.on("mouse:wheel", (opt) => {
      const delta = opt.e.deltaY;
      let newZoom = canvas.getZoom() * (delta > 0 ? 0.95 : 1.05);
      newZoom = Math.min(5, Math.max(0.1, newZoom));
      canvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), newZoom);
      setZoom(Math.round(newZoom * 100));
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    return canvas;
  }, []);

  const generateLayerId = useCallback(() => {
    layerCountRef.current += 1;
    return `layer-${Date.now()}-${layerCountRef.current}`;
  }, []);

  const addLayer = useCallback((obj: fabric.FabricObject, name: string, type: CanvasLayer["type"]) => {
    const id = generateLayerId();
    (obj as any).__layerId = id;
    
    const canvas = canvasRef.current;
    if (!canvas) return id;

    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();

    const newLayer: CanvasLayer = {
      id,
      name,
      type,
      visible: true,
      locked: false,
      opacity: 100,
      fabricObject: obj,
    };

    setLayers((prev) => [newLayer, ...prev]);
    setSelectedLayerId(id);
    return id;
  }, [generateLayerId]);

  const addImageFromUrl = useCallback(async (url: string, name = "Image") => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const img = await fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" });
      
      // Scale to fit canvas
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const scale = Math.min(
        (canvasWidth * 0.8) / img.width!,
        (canvasHeight * 0.8) / img.height!,
        1
      );
      
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvasWidth - img.width! * scale) / 2,
        top: (canvasHeight - img.height! * scale) / 2,
      });

      return addLayer(img, name, "image");
    } catch (err) {
      console.error("Failed to load image:", err);
    }
  }, [addLayer]);

  const addAIImage = useCallback(async (url: string, description: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const img = await fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" });
      
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const scale = Math.min(
        (canvasWidth * 0.8) / img.width!,
        (canvasHeight * 0.8) / img.height!,
        1
      );
      
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvasWidth - img.width! * scale) / 2,
        top: (canvasHeight - img.height! * scale) / 2,
      });

      return addLayer(img, `AI: ${description.slice(0, 30)}`, "ai");
    } catch (err) {
      console.error("Failed to load AI image:", err);
    }
  }, [addLayer]);

  const addText = useCallback((text = "Double-click to edit") => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const textObj = new fabric.IText(text, {
      left: canvas.getWidth() / 2 - 100,
      top: canvas.getHeight() / 2 - 20,
      fontSize: 36,
      fill: "#ffffff",
      fontFamily: "Inter, sans-serif",
      editable: true,
    });

    return addLayer(textObj, `Text: ${text.slice(0, 20)}`, "text");
  }, [addLayer]);

  const addRectangle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = new fabric.Rect({
      left: canvas.getWidth() / 2 - 75,
      top: canvas.getHeight() / 2 - 50,
      width: 150,
      height: 100,
      fill: "rgba(139, 92, 246, 0.5)",
      stroke: "#8b5cf6",
      strokeWidth: 2,
      rx: 8,
      ry: 8,
    });

    return addLayer(rect, "Rectangle", "shape");
  }, [addLayer]);

  const addEllipse = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ellipse = new fabric.Ellipse({
      left: canvas.getWidth() / 2 - 60,
      top: canvas.getHeight() / 2 - 40,
      rx: 60,
      ry: 40,
      fill: "rgba(59, 130, 246, 0.5)",
      stroke: "#3b82f6",
      strokeWidth: 2,
    });

    return addLayer(ellipse, "Ellipse", "shape");
  }, [addLayer]);

  const enableDrawing = useCallback((enable: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = enable;
    if (enable) {
      const brush = new fabric.PencilBrush(canvas);
      brush.color = brushColor;
      brush.width = brushSize;
      canvas.freeDrawingBrush = brush;
    }
  }, [brushColor, brushSize]);

  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObjects();
    if (active.length === 0) return;

    active.forEach((obj) => {
      const layerId = (obj as any).__layerId;
      canvas.remove(obj);
      setLayers((prev) => prev.filter((l) => l.id !== layerId));
    });

    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }, []);

  const toggleLayerVisibility = useCallback((layerId: string) => {
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id === layerId) {
          const newVisible = !l.visible;
          if (l.fabricObject) {
            l.fabricObject.visible = newVisible;
            canvasRef.current?.requestRenderAll();
          }
          return { ...l, visible: newVisible };
        }
        return l;
      })
    );
  }, []);

  const toggleLayerLock = useCallback((layerId: string) => {
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id === layerId) {
          const newLocked = !l.locked;
          if (l.fabricObject) {
            l.fabricObject.selectable = !newLocked;
            l.fabricObject.evented = !newLocked;
            canvasRef.current?.requestRenderAll();
          }
          return { ...l, locked: newLocked };
        }
        return l;
      })
    );
  }, []);

  const setLayerOpacity = useCallback((layerId: string, opacity: number) => {
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id === layerId) {
          if (l.fabricObject) {
            l.fabricObject.opacity = opacity / 100;
            canvasRef.current?.requestRenderAll();
          }
          return { ...l, opacity };
        }
        return l;
      })
    );
  }, []);

  const selectLayer = useCallback((layerId: string) => {
    setSelectedLayerId(layerId);
    const layer = layers.find((l) => l.id === layerId);
    if (layer?.fabricObject && canvasRef.current) {
      canvasRef.current.setActiveObject(layer.fabricObject);
      canvasRef.current.requestRenderAll();
    }
  }, [layers]);

  // Apply tool changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reset drawing mode
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.defaultCursor = "default";

    switch (activeTool) {
      case "Select":
      case "Move":
        canvas.selection = true;
        break;
      case "Pan":
        canvas.selection = false;
        canvas.defaultCursor = "grab";
        break;
      case "Brush":
        enableDrawing(true);
        break;
      case "Eraser":
        canvas.isDrawingMode = true;
        if (canvas.freeDrawingBrush) {
          const brush = new fabric.PencilBrush(canvas);
          brush.color = "#1a1a2e"; // background color to simulate erase
          brush.width = brushSize * 2;
          canvas.freeDrawingBrush = brush;
        }
        break;
      case "Text":
        canvas.defaultCursor = "text";
        break;
      case "Rectangle":
      case "Ellipse":
        canvas.defaultCursor = "crosshair";
        break;
    }
  }, [activeTool, enableDrawing, brushSize]);

  const handleToolAction = useCallback((tool: ToolType) => {
    setActiveTool(tool);
    
    // Some tools create objects immediately
    switch (tool) {
      case "Text":
        addText();
        setActiveTool("Select");
        break;
      case "Rectangle":
        addRectangle();
        setActiveTool("Select");
        break;
      case "Ellipse":
        addEllipse();
        setActiveTool("Select");
        break;
    }
  }, [addText, addRectangle, addEllipse]);

  const zoomIn = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const newZoom = Math.min(5, canvas.getZoom() * 1.1);
    canvas.setZoom(newZoom);
    setZoom(Math.round(newZoom * 100));
  }, []);

  const zoomOut = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const newZoom = Math.max(0.1, canvas.getZoom() * 0.9);
    canvas.setZoom(newZoom);
    setZoom(Math.round(newZoom * 100));
  }, []);

  const resetZoom = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setZoom(1);
    canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    canvas.requestRenderAll();
    setZoom(100);
  }, []);

  const exportCanvasAsDataUrl = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL({ format: "png", multiplier: 2 });
  }, []);

  return {
    canvasRef: canvasRef,
    containerRef,
    initCanvas,
    layers,
    activeTool,
    setActiveTool: handleToolAction,
    selectedLayerId,
    selectLayer,
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    addImageFromUrl,
    addAIImage,
    addText,
    addRectangle,
    addEllipse,
    enableDrawing,
    deleteSelected,
    toggleLayerVisibility,
    toggleLayerLock,
    setLayerOpacity,
    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize,
    exportCanvasAsDataUrl,
  };
}
