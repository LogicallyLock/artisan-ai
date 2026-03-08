import { useState } from "react";
import { X, UserPlus, Copy, Check, Users, Crown, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Collaborator {
  id: string;
  user_id: string;
  role: string;
  invited_email: string | null;
  profile?: { display_name: string | null; avatar_url: string | null };
}

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export function ShareDialog({ open, onClose, projectId, projectName }: ShareDialogProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadCollaborators = async () => {
    const { data } = await supabase
      .from("project_collaborators")
      .select("*")
      .eq("project_id", projectId);
    if (data) setCollaborators(data);
  };

  // Load on open
  useState(() => {
    if (open) loadCollaborators();
  });

  const inviteUser = async () => {
    if (!email.trim()) return;
    setLoading(true);

    // Look up user by email in profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .ilike("display_name", `%${email}%`);

    // For now, store the invite with the email
    const { error } = await supabase
      .from("project_collaborators")
      .insert({
        project_id: projectId,
        user_id: profiles?.[0]?.user_id || "00000000-0000-0000-0000-000000000000",
        role: "editor",
        invited_email: email.trim(),
      });

    if (error) {
      if (error.code === "23505") toast.error("Already invited");
      else toast.error("Failed to invite");
    } else {
      toast.success(`Invited ${email}`);
      setEmail("");
      loadCollaborators();
    }
    setLoading(false);
  };

  const removeCollaborator = async (id: string) => {
    await supabase.from("project_collaborators").delete().eq("id", id);
    setCollaborators((c) => c.filter((x) => x.id !== id));
    toast.success("Removed collaborator");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/editor/${projectId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied!");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-[440px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Share "{projectName}"</span>
          </div>
          <button onClick={onClose} className="studio-tool-btn w-7 h-7">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Invite */}
          <div className="flex gap-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or username..."
              className="flex-1 px-3 py-2 rounded-lg bg-secondary text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
              onKeyDown={(e) => e.key === "Enter" && inviteUser()}
            />
            <button
              onClick={inviteUser}
              disabled={loading || !email.trim()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              Invite
            </button>
          </div>

          {/* Copy link */}
          <button
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-studio-green" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy project link"}
          </button>

          {/* Collaborators list */}
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">People with access</span>

            {/* Owner */}
            <div className="flex items-center gap-3 py-2 px-2 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Crown className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">You (Owner)</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">Owner</span>
            </div>

            {collaborators.map((c) => (
              <div key={c.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-secondary/50 group">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Pencil className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{c.invited_email || "User"}</p>
                  <p className="text-xs text-muted-foreground capitalize">{c.role}</p>
                </div>
                <button
                  onClick={() => removeCollaborator(c.id)}
                  className="opacity-0 group-hover:opacity-100 studio-tool-btn w-7 h-7 text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
