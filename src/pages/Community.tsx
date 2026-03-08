import { ArrowLeft, MessageSquare, Users, HelpCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";

const channels = [
  { icon: MessageSquare, name: "Discord Server", desc: "Join 15,000+ creators sharing tips, getting feedback, and connecting with the team.", members: "15.2K members", link: "#", color: "bg-[hsl(250,60%,55%)]/10 text-[hsl(250,60%,55%)]" },
  { icon: Users, name: "Reddit Community", desc: "r/AICreativeStudio — share your work, ask questions, and participate in weekly challenges.", members: "8.5K members", link: "#", color: "bg-[hsl(16,100%,50%)]/10 text-[hsl(16,100%,50%)]" },
  { icon: HelpCircle, name: "Help Center", desc: "Browse FAQs, troubleshooting guides, and detailed documentation for every feature.", members: "500+ articles", link: "#", color: "bg-primary/10 text-primary" },
];

const discussions = [
  { title: "What's your favorite AI prompt for portrait editing?", replies: 47, author: "Sarah M.", time: "2h ago" },
  { title: "Show off your before/after edits — March 2026 thread", replies: 123, author: "ModTeam", time: "5h ago" },
  { title: "Tips for getting better AI sky replacements", replies: 31, author: "Jake R.", time: "8h ago" },
  { title: "Feature request: Batch export with watermarks", replies: 18, author: "Studio Pro", time: "1d ago" },
  { title: "Best color grading presets for wedding photography?", replies: 56, author: "Lisa K.", time: "1d ago" },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <div className="max-w-5xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-4">Community</h1>
          <p className="text-lg text-muted-foreground">Connect with creators, share your work, and learn together.</p>
        </motion.div>

        {/* Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {channels.map((ch, i) => (
            <motion.a
              key={ch.name}
              href={ch.link}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all group"
            >
              <div className={`w-10 h-10 rounded-lg ${ch.color} flex items-center justify-center mb-3`}>
                <ch.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors flex items-center gap-1">
                {ch.name} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-muted-foreground mb-2">{ch.desc}</p>
              <span className="text-[10px] text-primary font-medium">{ch.members}</span>
            </motion.a>
          ))}
        </div>

        {/* Trending discussions */}
        <h2 className="text-xl font-bold text-foreground mb-4">Trending Discussions</h2>
        <div className="space-y-2">
          {discussions.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.04 }}
              className="bg-card border border-border rounded-lg px-5 py-3 flex items-center justify-between hover:border-primary/20 transition-all cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground truncate">{d.title}</p>
                <p className="text-xs text-muted-foreground">by {d.author} · {d.time}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-4">
                <MessageSquare className="w-3 h-3" /> {d.replies}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
