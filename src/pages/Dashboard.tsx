import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus, Sparkles, Image, Film, Clock, Trash2,
  LogOut, User, Search, Settings, FolderOpen, LayoutGrid
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { TemplateGallery } from "@/components/studio/TemplateGallery";

interface Project {
  id: string;
  name: string;
  type: string;
  description: string | null;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  updated_at: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      toast.error("Failed to load projects");
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const createProject = async (type: "image" | "video") => {
    setCreating(true);
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user!.id,
        name: `Untitled ${type === "image" ? "Photo" : "Video"} Project`,
        type,
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

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete project");
    } else {
      setProjects((p) => p.filter((proj) => proj.id !== id));
      toast.success("Project deleted");
    }
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen studio-surface">
      {/* Header */}
      <header className="h-14 studio-toolbar border-b border-border flex items-center px-6 justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">AI Creative Studio</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{user?.user_metadata?.full_name || user?.email}</span>
          </div>
          <button
            onClick={() => navigate("/settings")}
            className="studio-tool-btn w-8 h-8"
            title="Profile settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={signOut}
            className="studio-tool-btn w-8 h-8"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Title + search */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Your Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none w-64 focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* New project cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => createProject("image")}
            disabled={creating}
            className="group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-card/50 hover:bg-card transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Image className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">New Photo</p>
              <p className="text-xs text-muted-foreground">Image editor</p>
            </div>
          </button>

          <button
            onClick={() => createProject("video")}
            disabled={creating}
            className="group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-border hover:border-accent/50 bg-card/50 hover:bg-card transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Film className="w-6 h-6 text-accent" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">New Video</p>
              <p className="text-xs text-muted-foreground">Video editor</p>
            </div>
          </button>

          <button
            onClick={() => setTemplateGalleryOpen(true)}
            className="group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-card/50 hover:bg-card transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <LayoutGrid className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">From Template</p>
              <p className="text-xs text-muted-foreground">Browse gallery</p>
            </div>
          </button>
        </div>

        {/* Project list */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading projects...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {search ? "No projects match your search" : "No projects yet — create one above!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/editor/${project.id}`)}
                className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="h-36 bg-muted flex items-center justify-center">
                  {project.thumbnail_url ? (
                    <img src={project.thumbnail_url} alt={project.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-muted-foreground">
                      {project.type === "video" ? <Film className="w-8 h-8" /> : <Image className="w-8 h-8" />}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}</span>
                      <span className="capitalize">• {project.type}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 studio-tool-btn w-7 h-7 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <TemplateGallery
        open={templateGalleryOpen}
        onClose={() => setTemplateGalleryOpen(false)}
      />
    </div>
  );
}
