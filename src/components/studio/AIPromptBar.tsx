import { useState } from "react";
import { Sparkles, Send, ChevronUp, Image, Film, Wand2, Eraser, Sun, CloudSun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const quickActions = [
  { icon: Eraser, label: "Remove Object" },
  { icon: CloudSun, label: "Replace Sky" },
  { icon: Sun, label: "Enhance Lighting" },
  { icon: Wand2, label: "Auto Enhance" },
  { icon: Image, label: "Upscale" },
  { icon: Film, label: "Generate B-Roll" },
];

export function AIPromptBar() {
  const [prompt, setPrompt] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setPrompt("");
    }, 2000);
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
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map(action => (
                <button
                  key={action.label}
                  onClick={() => { setPrompt(action.label.toLowerCase()); setExpanded(false); }}
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
            placeholder='Try "Remove the person behind me" or "Make the sky sunset"'
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={() => setExpanded(!expanded)}
            className="studio-tool-btn w-8 h-8"
          >
            <ChevronUp className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || processing}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all"
          >
            {processing ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
