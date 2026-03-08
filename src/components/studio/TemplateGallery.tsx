import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { X, Sparkles, ImageIcon, Film, Search, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  thumbnail_url: string | null;
  canvas_data: any;
  layers_data: any;
  type: string;
  width: number;
  height: number;
}

const CATEGORIES = ["all", "general", "social", "creative", "print", "video"];

const CATEGORY_ICONS: Record<string, string> = {
  general: "✨",
  social: "📱",
  creative: "🎨",
  print: "🖨️",
  video: "🎬",
};

interface TemplateGalleryProps {
  open: boolean;
  onClose: () => void;
}

export function TemplateGallery({ open, onClose }: TemplateGalleryProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) fetchTemplates();
  }, [open]);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .order("created_at");
    if (data) setTemplates(data as Template[]);
    setLoading(false);
  };

  const createFromTemplate = async (template: Template) => {
    if (!user) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: `${template.name} Project`,
        type: template.type,
        width: template.width,
        height: template.height,
        canvas_data: template.canvas_data,
        layers_data: template.layers_data,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create project");
      setCreating(false);
      return;
    }
    navigate(`/editor/${data.id}`);
  };

  const filtered = templates.filter((t) => {
    const matchCat = category === "all" || t.category === category;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-[700px] max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Template Gallery</span>
            </div>
            <button onClick={onClose} className="studio-tool-btn w-7 h-7">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search + filters */}
          <div className="px-5 py-3 border-b border-border space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    category === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat !== "all" && CATEGORY_ICONS[cat]} {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Loading templates...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No templates found</div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {filtered.map((t, i) => (
                  <motion.button
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => createFromTemplate(t)}
                    disabled={creating}
                    className="group text-left bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/30 rounded-xl overflow-hidden transition-all disabled:opacity-50"
                  >
                    {/* Preview */}
                    <div className="h-24 bg-muted flex items-center justify-center relative">
                      <div className="flex flex-col items-center gap-1.5">
                        {t.type === "video" ? (
                          <Film className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        ) : (
                          <Image className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                        <div
                          className="border-2 border-border/60 bg-background/60 rounded-sm"
                          style={{
                            width: Math.min(60, t.width / (t.height / 40)),
                            height: Math.min(45, t.height / (t.width / 55)),
                          }}
                        />
                      </div>
                      <span className="absolute top-2 right-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {t.category}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-medium text-foreground truncate">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {t.width} × {t.height}px
                      </p>
                      {t.description && (
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
