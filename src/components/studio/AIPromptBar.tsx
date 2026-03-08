import { useState } from "react";
import { Sparkles, Send, ChevronUp, Image, Film, Wand2, Eraser, Sun, CloudSun, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const quickActions = [
  { icon: Eraser, label: "Remove Object" },
  { icon: CloudSun, label: "Replace Sky" },
  { icon: Sun, label: "Enhance Lighting" },
  { icon: Wand2, label: "Auto Enhance" },
  { icon: Image, label: "Upscale" },
  { icon: Film, label: "Generate B-Roll" },
];

interface AIPromptBarProps {
  currentImageUrl?: string | null;
  onAIResult?: (imageUrl: string, description: string) => void;
}

export function AIPromptBar({ currentImageUrl, onAIResult }: AIPromptBarProps) {
  const [prompt, setPrompt] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim() || processing) return;
    setProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-image-edit", {
        body: {
          prompt: prompt.trim(),
          imageUrl: currentImageUrl || null,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.imageUrl) {
        onAIResult?.(data.imageUrl, prompt.trim());
        toast.success("AI edit applied!");
      } else if (data?.text) {
        toast.info(data.text);
      } else {
        toast.error("AI couldn't generate an image for this request");
      }
    } catch (err: any) {
      console.error("AI edit error:", err);
      toast.error(err.message || "AI editing failed");
    } finally {
      setProcessing(false);
      setPrompt("");
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-2 bg-card/95 backdrop-blur-xl border border-border rounded-xl p-3 shadow-2xl"
          >
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">
              Quick Actions
            </p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    setPrompt(action.label.toLowerCase());
                    setExpanded(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-xs text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  <action.icon className="w-3.5 h-3.5 text-primary" />
                  {action.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl glow-primary overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3">
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={
              processing
                ? "AI is processing your edit..."
                : 'Try "Remove the person behind me" or "Make the sky sunset"'
            }
            disabled={processing}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
          />
          <button
            onClick={() => setExpanded(!expanded)}
            className="studio-tool-btn w-8 h-8"
            disabled={processing}
          >
            <ChevronUp
              className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || processing}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all"
          >
            {processing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {processing && (
          <div className="px-4 pb-3">
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "90%" }}
                transition={{ duration: 15, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Processing with Gemini AI...</p>
          </div>
        )}
      </div>
    </div>
  );
}
