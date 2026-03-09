import { useRef, useState, useCallback, useEffect } from "react";
import * as fabric from "fabric";

// Undo/Redo history management
function useCanvasHistory() {
  const historyRef = useRef<string[]>([]);
  const indexRef = useRef(-1);
  const isRestoringRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateFlags = useCallback(() => {
    setCanUndo(indexRef.current > 0);
    setCanRedo(indexRef.current < historyRef.current.length - 1);
  }, []);

  const saveState = useCallback((canvas: fabric.Canvas) => {
    if (isRestoringRef.current) return;
    const canvasJson = canvas.toJSON();
    // Preserve custom __layerId on each object
    const objects = canvas.getObjects();
    if (canvasJson.objects) {
      canvasJson.objects.forEach((objJson: any, i: number) => {
        if (objects[i] && (objects[i] as any).__layerId) {
          objJson.__layerId = (objects[i] as any).__layerId;
        }
      });
    }
    const json = JSON.stringify(canvasJson);
    // Truncate forward history
    historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
    historyRef.current.push(json);
    // Cap at 50 entries
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
    } else {
      indexRef.current++;
    }
    updateFlags();
  }, [updateFlags]);

  const restore = useCallback(async (canvas: fabric.Canvas, direction: "undo" | "redo") => {
    const newIndex = direction === "undo" ? indexRef.current - 1 : indexRef.current + 1;
    if (newIndex < 0 || newIndex >= historyRef.current.length) return;
    indexRef.current = newIndex;
    isRestoringRef.current = true;
    const jsonStr = historyRef.current[newIndex];
    const parsed = JSON.parse(jsonStr);
    // Extract custom __layerId before loading
    const layerIds = (parsed.objects || []).map((o: any) => o.__layerId || null);
    await canvas.loadFromJSON(parsed);
    // Re-apply __layerId to restored objects
    const objects = canvas.getObjects();
    objects.forEach((obj, i) => {
      if (layerIds[i]) {
        (obj as any).__layerId = layerIds[i];
      }
    });
    canvas.requestRenderAll();
    isRestoringRef.current = false;
    updateFlags();
  }, [updateFlags]);

  return { saveState, restore, isRestoringRef, canUndo, canRedo };
}

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
  const [activeTool, setActiveToolState] = useState<ToolType>("Select");
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [brushColor, setBrushColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(5);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const layerCountRef = useRef(0);
  const isPanningRef = useRef(false);
  const history = useCanvasHistory();
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDrawingShapeRef = useRef(false);
  const shapeStartRef = useRef<{ x: number; y: number } | null>(null);
  const currentShapeRef = useRef<fabric.FabricObject | null>(null);
  const cropRectRef = useRef<fabric.Rect | null>(null);
  const activeToolRef = useRef<ToolType>("Select");

  // Keep ref in sync
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

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

    // Mouse down - handles Pan, Zoom click, Shape drawing, Color Picker
    canvas.on("mouse:down", (opt) => {
      const tool = activeToolRef.current;
      const evt = opt.e as MouseEvent;

      if (tool === "Pan") {
        isPanningRef.current = true;
        lastPosRef.current = { x: evt.clientX, y: evt.clientY };
        canvas.selection = false;
        canvas.defaultCursor = "grabbing";
        return;
      }

      if (tool === "Zoom") {
        const pointer = canvas.getScenePoint(evt);
        const point = new fabric.Point(pointer.x, pointer.y);
        const direction = evt.altKey ? 0.9 : 1.1;
        let newZoom = canvas.getZoom() * direction;
        newZoom = Math.min(5, Math.max(0.1, newZoom));
        canvas.zoomToPoint(point, newZoom);
        setZoom(Math.round(newZoom * 100));
        return;
      }

      if (tool === "Color Picker") {
        // Sample color from canvas pixel
        const pointer = canvas.getScenePoint(evt);
        const ctx = canvas.getContext();
        const pixel = ctx.getImageData(
          Math.round(pointer.x * canvas.getZoom()),
          Math.round(pointer.y * canvas.getZoom()),
          1, 1
        ).data;
        const hex = `#${pixel[0].toString(16).padStart(2, "0")}${pixel[1].toString(16).padStart(2, "0")}${pixel[2].toString(16).padStart(2, "0")}`;
        setPickedColor(hex);
        setBrushColor(hex);
        return;
      }

      // Shape drawing (Rectangle/Ellipse draw-to-create)
      if (tool === "Rectangle" || tool === "Ellipse") {
        isDrawingShapeRef.current = true;
        const pointer = canvas.getScenePoint(evt);
        shapeStartRef.current = { x: pointer.x, y: pointer.y };

        if (tool === "Rectangle") {
          const rect = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            fill: "rgba(139, 92, 246, 0.3)",
            stroke: "#8b5cf6",
            strokeWidth: 2,
            rx: 4,
            ry: 4,
            selectable: false,
            evented: false,
          });
          canvas.add(rect);
          currentShapeRef.current = rect;
        } else {
          const ellipse = new fabric.Ellipse({
            left: pointer.x,
            top: pointer.y,
            rx: 0,
            ry: 0,
            fill: "rgba(59, 130, 246, 0.3)",
            stroke: "#3b82f6",
            strokeWidth: 2,
            selectable: false,
            evented: false,
          });
          canvas.add(ellipse);
          currentShapeRef.current = ellipse;
        }
        return;
      }

      // Crop tool - draw crop region
      if (tool === "Crop") {
        isDrawingShapeRef.current = true;
        const pointer = canvas.getScenePoint(evt);
        shapeStartRef.current = { x: pointer.x, y: pointer.y };
        const cropRect = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: "rgba(255,255,255,0.1)",
          stroke: "#ffffff",
          strokeWidth: 1,
          strokeDashArray: [5, 5],
          selectable: false,
          evented: false,
        });
        canvas.add(cropRect);
        cropRectRef.current = cropRect;
        currentShapeRef.current = cropRect;
        return;
      }
    });

    canvas.on("mouse:move", (opt) => {
      const tool = activeToolRef.current;
      const evt = opt.e as MouseEvent;

      // Pan
      if (isPanningRef.current && lastPosRef.current) {
        const vpt = canvas.viewportTransform!;
        vpt[4] += evt.clientX - lastPosRef.current.x;
        vpt[5] += evt.clientY - lastPosRef.current.y;
        canvas.requestRenderAll();
        lastPosRef.current = { x: evt.clientX, y: evt.clientY };
        return;
      }

      // Shape / Crop drawing
      if (isDrawingShapeRef.current && shapeStartRef.current && currentShapeRef.current) {
        const pointer = canvas.getScenePoint(evt);
        const startX = shapeStartRef.current.x;
        const startY = shapeStartRef.current.y;
        const w = pointer.x - startX;
        const h = pointer.y - startY;

        const shape = currentShapeRef.current;
        shape.set({
          left: w > 0 ? startX : pointer.x,
          top: h > 0 ? startY : pointer.y,
        });

        if (shape instanceof fabric.Ellipse) {
          shape.set({ rx: Math.abs(w) / 2, ry: Math.abs(h) / 2 });
          // Adjust position for ellipse center
          shape.set({
            left: (w > 0 ? startX : pointer.x),
            top: (h > 0 ? startY : pointer.y),
          });
        } else {
          shape.set({ width: Math.abs(w), height: Math.abs(h) });
        }

        canvas.requestRenderAll();
      }
    });

    canvas.on("mouse:up", (opt) => {
      const tool = activeToolRef.current;

      // End pan
      if (isPanningRef.current) {
        isPanningRef.current = false;
        lastPosRef.current = null;
        canvas.defaultCursor = tool === "Pan" ? "grab" : "default";
        return;
      }

      // End shape drawing
      if (isDrawingShapeRef.current && currentShapeRef.current) {
        isDrawingShapeRef.current = false;
        const shape = currentShapeRef.current;

        // If crop tool, apply crop on mouse up
        if (tool === "Crop" && cropRectRef.current) {
          applyCrop(canvas, cropRectRef.current);
          cropRectRef.current = null;
          currentShapeRef.current = null;
          shapeStartRef.current = null;
          return;
        }

        // Check minimum size - if too small, remove and create default
        const w = shape instanceof fabric.Ellipse ? (shape.rx || 0) * 2 : (shape.width || 0);
        const h = shape instanceof fabric.Ellipse ? (shape.ry || 0) * 2 : (shape.height || 0);

        if (w < 5 && h < 5) {
          canvas.remove(shape);
          // Create a default-sized shape
          if (tool === "Rectangle") {
            const rect = new fabric.Rect({
              left: canvas.getWidth() / 2 - 75,
              top: canvas.getHeight() / 2 - 50,
              width: 150,
              height: 100,
              fill: "rgba(139, 92, 246, 0.3)",
              stroke: "#8b5cf6",
              strokeWidth: 2,
              rx: 4,
              ry: 4,
            });
            currentShapeRef.current = rect;
            canvas.add(rect);
            addLayerForObject(rect, "Rectangle", "shape");
          } else if (tool === "Ellipse") {
            const ellipse = new fabric.Ellipse({
              left: canvas.getWidth() / 2 - 60,
              top: canvas.getHeight() / 2 - 40,
              rx: 60,
              ry: 40,
              fill: "rgba(59, 130, 246, 0.3)",
              stroke: "#3b82f6",
              strokeWidth: 2,
            });
            currentShapeRef.current = ellipse;
            canvas.add(ellipse);
            addLayerForObject(ellipse, "Ellipse", "shape");
          }
        } else {
          // Finalize the drawn shape as a proper layer
          shape.set({ selectable: true, evented: true });
          const name = tool === "Rectangle" ? "Rectangle" : "Ellipse";
          addLayerForObject(shape, name, "shape");
        }

        currentShapeRef.current = null;
        shapeStartRef.current = null;
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

    // Path created from free drawing → register as layer
    canvas.on("path:created", (e: any) => {
      const path = e.path as fabric.Path;
      if (path) {
        const tool = activeToolRef.current;
        const name = tool === "Eraser" ? "Eraser Stroke" : tool === "Pen" ? "Pen Path" : "Brush Stroke";
        addLayerForObject(path, name, "drawing");
      }
    });

    // Save history on every object modification
    const saveHistory = () => history.saveState(canvas);
    canvas.on("object:added", saveHistory);
    canvas.on("object:modified", saveHistory);
    canvas.on("object:removed", saveHistory);
    // Save initial state
    history.saveState(canvas);

    return canvas;
  }, []);

  // Helper to add a fabric object as a tracked layer (used inside canvas event handlers)
  const addLayerForObject = useCallback((obj: fabric.FabricObject, name: string, type: CanvasLayer["type"]) => {
    layerCountRef.current += 1;
    const id = `layer-${Date.now()}-${layerCountRef.current}`;
    (obj as any).__layerId = id;

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
    }

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
  }, []);

  const applyCrop = useCallback((canvas: fabric.Canvas, cropRect: fabric.Rect) => {
    const left = cropRect.left || 0;
    const top = cropRect.top || 0;
    const width = cropRect.width || 0;
    const height = cropRect.height || 0;

    canvas.remove(cropRect);

    if (width < 10 || height < 10) {
      canvas.requestRenderAll();
      return;
    }

    // Export the crop region as image
    const dataUrl = canvas.toDataURL({
      format: "png",
      left,
      top,
      width,
      height,
      multiplier: 1,
    });

    // Clear canvas and load cropped image
    const objects = canvas.getObjects().slice();
    objects.forEach((obj) => canvas.remove(obj));
    setLayers([]);

    fabric.FabricImage.fromURL(dataUrl, { crossOrigin: "anonymous" }).then((img) => {
      img.set({ left: 0, top: 0 });
      canvas.setDimensions({ width, height });
      canvas.add(img);
      addLayerForObject(img, "Cropped Image", "image");
      canvas.requestRenderAll();
    });
  }, [addLayerForObject]);

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
      fill: "rgba(139, 92, 246, 0.3)",
      stroke: "#8b5cf6",
      strokeWidth: 2,
      rx: 4,
      ry: 4,
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
      fill: "rgba(59, 130, 246, 0.3)",
      stroke: "#3b82f6",
      strokeWidth: 2,
    });
    return addLayer(ellipse, "Ellipse", "shape");
  }, [addLayer]);

  const enableDrawing = useCallback((enable: boolean, mode: "brush" | "pen" | "eraser" = "brush") => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = enable;
    if (enable) {
      const brush = new fabric.PencilBrush(canvas);
      if (mode === "eraser") {
        brush.color = "#1a1a2e"; // background color to simulate erase
        brush.width = brushSize * 3;
      } else if (mode === "pen") {
        brush.color = brushColor;
        brush.width = Math.max(1, brushSize / 2); // thinner for pen
      } else {
        brush.color = brushColor;
        brush.width = brushSize;
      }
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

    // Reset modes
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.defaultCursor = "default";
    canvas.getObjects().forEach((obj) => {
      if (!(obj as any).__isCropOverlay) {
        obj.selectable = !(obj as any).__isLocked;
        obj.evented = !(obj as any).__isLocked;
      }
    });

    switch (activeTool) {
      case "Select":
        canvas.selection = true;
        canvas.defaultCursor = "default";
        break;
      case "Move":
        canvas.selection = true;
        canvas.defaultCursor = "move";
        break;
      case "Pan":
        canvas.selection = false;
        canvas.defaultCursor = "grab";
        canvas.getObjects().forEach((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        break;
      case "Zoom":
        canvas.selection = false;
        canvas.defaultCursor = "zoom-in";
        canvas.getObjects().forEach((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        break;
      case "Crop":
        canvas.selection = false;
        canvas.defaultCursor = "crosshair";
        canvas.getObjects().forEach((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        break;
      case "Rectangle":
      case "Ellipse":
        canvas.selection = false;
        canvas.defaultCursor = "crosshair";
        canvas.getObjects().forEach((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        break;
      case "Text":
        canvas.defaultCursor = "text";
        break;
      case "Brush":
        enableDrawing(true, "brush");
        break;
      case "Pen":
        enableDrawing(true, "pen");
        break;
      case "Eraser":
        enableDrawing(true, "eraser");
        break;
      case "Color Picker":
        canvas.selection = false;
        canvas.defaultCursor = "crosshair";
        canvas.getObjects().forEach((obj) => {
          obj.selectable = false;
          obj.evented = false;
        });
        break;
    }

    canvas.requestRenderAll();
  }, [activeTool, enableDrawing]);

  const handleToolAction = useCallback((tool: ToolType) => {
    setActiveToolState(tool);

    // Text creates object immediately on click
    if (tool === "Text") {
      addText();
      setActiveToolState("Select");
    }
  }, [addText]);

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

  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) history.restore(canvas, "undo").then(() => syncLayersFromCanvas());
  }, []);

  const redo = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) history.restore(canvas, "redo").then(() => syncLayersFromCanvas());
  }, []);

  // Rebuild layers state from canvas objects after undo/redo
  const syncLayersFromCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const objects = canvas.getObjects();
    const newLayers: CanvasLayer[] = objects
      .filter((obj) => (obj as any).__layerId)
      .map((obj) => ({
        id: (obj as any).__layerId,
        name: (obj as any).__layerId || "Layer",
        type: "shape" as CanvasLayer["type"],
        visible: obj.visible !== false,
        locked: !obj.selectable,
        opacity: Math.round((obj.opacity ?? 1) * 100),
        fabricObject: obj,
      }))
      .reverse();
    setLayers(newLayers);
  }, []);

  const setSelectedFill = useCallback((color: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      active.set("fill", color);
      canvas.requestRenderAll();
    }
  }, []);

  const setSelectedStroke = useCallback((color: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      active.set("stroke", color);
      canvas.requestRenderAll();
    }
  }, []);

  const getSelectedObjectProps = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const active = canvas.getActiveObject();
    if (!active) return null;
    const isText = active.type === 'textbox' || active.type === 'i-text' || active.type === 'text';
    return {
      fill: typeof active.fill === "string" ? active.fill : null,
      stroke: typeof active.stroke === "string" ? active.stroke : null,
      isText,
      fontFamily: isText ? (active as any).fontFamily || "Arial" : null,
      fontSize: isText ? (active as any).fontSize || 24 : null,
    };
  }, []);

  const setSelectedFontFamily = useCallback((font: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && (active.type === 'textbox' || active.type === 'i-text' || active.type === 'text')) {
      (active as any).set('fontFamily', font);
      canvas.renderAll();
      history.saveState(canvas);
    }
  }, [history]);

  const setSelectedFontSize = useCallback((size: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && (active.type === 'textbox' || active.type === 'i-text' || active.type === 'text')) {
      (active as any).set('fontSize', size);
      canvas.renderAll();
      history.saveState(canvas);
    }
  }, [history]);

  return {
    canvasRef,
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
    pickedColor,
    exportCanvasAsDataUrl,
    undo,
    redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    setSelectedFill,
    setSelectedStroke,
    getSelectedObjectProps,
    setSelectedFontFamily,
    setSelectedFontSize,
  };
}
