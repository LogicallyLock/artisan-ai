import { motion } from "framer-motion";
import { Youtube, Film, Camera, Clapperboard, Video, Podcast } from "lucide-react";

const creators = [
  {
    icon: Youtube,
    title: "YouTubers",
    description: "Auto-generate thumbnails, highlight reels, and subtitles. Cut your editing time by 10x.",
  },
  {
    icon: Clapperboard,
    title: "AI Filmmakers",
    description: "Cinematic color grading, AI scene detection, and professional audio mixing for short films.",
  },
  {
    icon: Video,
    title: "Short-Form Creators",
    description: "Auto-detect best moments, vertical crop, and export directly for TikTok, Reels, and Shorts.",
  },
  {
    icon: Camera,
    title: "Photographers",
    description: "Batch editing, AI sky replacement, portrait retouching, and one-click background removal.",
  },
  {
    icon: Film,
    title: "Short Movie Creators",
    description: "Multi-track editing, transitions, text overlays, and AI-assisted color continuity across scenes.",
  },
  {
    icon: Podcast,
    title: "Content Marketers",
    description: "Quick social media graphics, video ads, and branded content creation with AI assistance.",
  },
];

export function CreatorsSection() {
  return (
    <section id="creators" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/50 to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">For Every Creator</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Built for the Way You Create
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Whether you're a YouTuber, filmmaker, or photographer — AI Creative Studio adapts to your workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator, i) => (
            <motion.div
              key={creator.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <creator.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{creator.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{creator.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
