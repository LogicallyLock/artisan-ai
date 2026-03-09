import { useCallback, useRef } from "react";
import * as fabric from "fabric";

const SNAP_THRESHOLD = 8;
const GUIDE_COLOR = "#ff3b9a";

export function useAlignmentGuides() {
  const guideLinesRef = useRef<fabric.Line[]>([]);

  const clearGuides = useCallback((canvas: fabric.Canvas) => {
    guideLinesRef.current.forEach((line) => canvas.remove(line));
    guideLinesRef.current = [];
  }, []);

  const addGuideLine = useCallback((canvas: fabric.Canvas, points: [number, number, number, number]) => {
    const line = new fabric.Line(points, {
      stroke: GUIDE_COLOR,
      strokeWidth: 1,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      excludeFromExport: true,
    });
    (line as any).__isGuide = true;
    canvas.add(line);
    guideLinesRef.current.push(line);
  }, []);

  const setupSnapping = useCallback((canvas: fabric.Canvas) => {
    canvas.on("object:moving", (e) => {
      const obj = e.target;
      if (!obj) return;

      clearGuides(canvas);

      const cw = canvas.getWidth();
      const ch = canvas.getHeight();
      const objLeft = obj.left!;
      const objTop = obj.top!;
      const objWidth = obj.getScaledWidth();
      const objHeight = obj.getScaledHeight();
      const objCenterX = objLeft + objWidth / 2;
      const objCenterY = objTop + objHeight / 2;
      const objRight = objLeft + objWidth;
      const objBottom = objTop + objHeight;

      // Canvas center guides
      const canvasCenterX = cw / 2;
      const canvasCenterY = ch / 2;

      // Snap to canvas center X
      if (Math.abs(objCenterX - canvasCenterX) < SNAP_THRESHOLD) {
        obj.set("left", canvasCenterX - objWidth / 2);
        addGuideLine(canvas, [canvasCenterX, 0, canvasCenterX, ch]);
      }
      // Snap to canvas center Y
      if (Math.abs(objCenterY - canvasCenterY) < SNAP_THRESHOLD) {
        obj.set("top", canvasCenterY - objHeight / 2);
        addGuideLine(canvas, [0, canvasCenterY, cw, canvasCenterY]);
      }
      // Snap to left edge
      if (Math.abs(objLeft) < SNAP_THRESHOLD) {
        obj.set("left", 0);
        addGuideLine(canvas, [0, 0, 0, ch]);
      }
      // Snap to right edge
      if (Math.abs(objRight - cw) < SNAP_THRESHOLD) {
        obj.set("left", cw - objWidth);
        addGuideLine(canvas, [cw, 0, cw, ch]);
      }
      // Snap to top edge
      if (Math.abs(objTop) < SNAP_THRESHOLD) {
        obj.set("top", 0);
        addGuideLine(canvas, [0, 0, cw, 0]);
      }
      // Snap to bottom edge
      if (Math.abs(objBottom - ch) < SNAP_THRESHOLD) {
        obj.set("top", ch - objHeight);
        addGuideLine(canvas, [0, ch, cw, ch]);
      }

      // Snap to other objects
      canvas.getObjects().forEach((other) => {
        if (other === obj || (other as any).__isGuide) return;
        const otherLeft = other.left!;
        const otherTop = other.top!;
        const otherWidth = other.getScaledWidth();
        const otherHeight = other.getScaledHeight();
        const otherCenterX = otherLeft + otherWidth / 2;
        const otherCenterY = otherTop + otherHeight / 2;
        const otherRight = otherLeft + otherWidth;
        const otherBottom = otherTop + otherHeight;

        // Horizontal alignment
        if (Math.abs(objCenterX - otherCenterX) < SNAP_THRESHOLD) {
          obj.set("left", otherCenterX - objWidth / 2);
          addGuideLine(canvas, [otherCenterX, Math.min(objTop, otherTop), otherCenterX, Math.max(objBottom, otherBottom)]);
        }
        if (Math.abs(objLeft - otherLeft) < SNAP_THRESHOLD) {
          obj.set("left", otherLeft);
          addGuideLine(canvas, [otherLeft, Math.min(objTop, otherTop), otherLeft, Math.max(objBottom, otherBottom)]);
        }
        if (Math.abs(objRight - otherRight) < SNAP_THRESHOLD) {
          obj.set("left", otherRight - objWidth);
          addGuideLine(canvas, [otherRight, Math.min(objTop, otherTop), otherRight, Math.max(objBottom, otherBottom)]);
        }

        // Vertical alignment
        if (Math.abs(objCenterY - otherCenterY) < SNAP_THRESHOLD) {
          obj.set("top", otherCenterY - objHeight / 2);
          addGuideLine(canvas, [Math.min(objLeft, otherLeft), otherCenterY, Math.max(objRight, otherRight), otherCenterY]);
        }
        if (Math.abs(objTop - otherTop) < SNAP_THRESHOLD) {
          obj.set("top", otherTop);
          addGuideLine(canvas, [Math.min(objLeft, otherLeft), otherTop, Math.max(objRight, otherRight), otherTop]);
        }
        if (Math.abs(objBottom - otherBottom) < SNAP_THRESHOLD) {
          obj.set("top", otherBottom - objHeight);
          addGuideLine(canvas, [Math.min(objLeft, otherLeft), otherBottom, Math.max(objRight, otherRight), otherBottom]);
        }
      });
    });

    canvas.on("object:modified", () => {
      clearGuides(canvas);
    });

    canvas.on("mouse:up", () => {
      clearGuides(canvas);
    });
  }, [clearGuides, addGuideLine]);

  return { setupSnapping };
}
