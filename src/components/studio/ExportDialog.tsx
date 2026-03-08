import { useState } from "react";
import { Download, X, Image, Film } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string | null;
  mode: "image" | "video";
}

const IMAGE_FORMATS = ["PNG", "JPEG", "WebP"] as const;
const VIDEO_FORMATS = ["MP4", "WebM"] as const;

export function ExportDialog({ open, onClose, imageUrl, mode }: ExportDialogProps) {
  const [format, setFormat] = useState<string>(mode === "image" ? "PNG" : "MP4");
  const [quality, setQuality] = useState(90);
  const [scale, setScale] = useState(100);
  const [exporting, setExporting] = useState(false);

  if (!open) return null;

  const formats = mode === "image" ? IMAGE_FORMATS : VIDEO_FORMATS;

  const handleExport = async () => {
    if (!imageUrl) {
      toast.error("No image to export");
      return;
    }

    setExporting(true);
    try {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * (scale / 100));
      canvas.height = Math.round(img.naturalHeight * (scale / 100));
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const mimeMap: Record<string, string> = {
        PNG: "image/png",
        JPEG: "image/jpeg",
        WebP: "image/webp",
      };

      const mime = mimeMap[format] || "image/png";
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), mime, quality / 100);
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export.${format.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported successfully!");
      onClose();
    } catch (err) {
      toast.error("Export failed — image may be from another domain");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-96 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Export</span>
          </div>
          <button onClick={onClose} className="studio-tool-btn w-7 h-7">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Format */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Format</label>
            <div className="flex gap-2">
              {formats.map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    format === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          {format !== "PNG" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quality</label>
                <span className="text-xs font-mono-code text-muted-foreground">{quality}%</span>
              </div>
              <Slider
                value={[quality]}
                onValueChange={([v]) => setQuality(v)}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          )}

          {/* Scale */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scale</label>
              <span className="text-xs font-mono-code text-muted-foreground">{scale}%</span>
            </div>
            <Slider
              value={[scale]}
              onValueChange={([v]) => setScale(v)}
              min={25}
              max={200}
              step={25}
              className="w-full"
            />
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={exporting || !imageUrl}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {exporting ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
