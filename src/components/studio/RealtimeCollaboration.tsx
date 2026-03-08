import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PresenceUser {
  user_id: string;
  email: string;
  color: string;
}

const COLORS = [
  "hsl(35, 95%, 55%)",   // primary/amber
  "hsl(200, 80%, 50%)",  // accent/blue
  "hsl(145, 60%, 45%)",  // green
  "hsl(280, 70%, 55%)",  // purple
  "hsl(350, 70%, 55%)",  // red
  "hsl(45, 90%, 55%)",   // yellow
];

export function useRealtimeCollaboration(projectId: string | undefined) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!projectId || !user) return;

    const channel = supabase.channel(`project:${projectId}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: PresenceUser[] = [];
        Object.entries(state).forEach(([key, presences]) => {
          if (key !== user.id && presences.length > 0) {
            const p = presences[0] as any;
            users.push({
              user_id: key,
              email: p.email || "User",
              color: COLORS[users.length % COLORS.length],
            });
          }
        });
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            email: user.email || "Anonymous",
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, user]);

  return { onlineUsers };
}

export function CollaboratorAvatars({ users }: { users: PresenceUser[] }) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {users.map((u) => (
        <div
          key={u.user_id}
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-primary-foreground ring-2 ring-background"
          style={{ backgroundColor: u.color }}
          title={u.email}
        >
          {u.email[0]?.toUpperCase() || "?"}
        </div>
      ))}
      <span className="text-xs text-muted-foreground ml-1">
        {users.length} online
      </span>
    </div>
  );
}
