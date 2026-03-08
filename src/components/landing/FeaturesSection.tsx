import { motion } from "framer-motion";
import {
  Wand2, Layers, Image, Film, Sparkles, Zap,
  CloudSun, UserCheck, Scissors, Palette, Volume2, Subtitles
} from "lucide-react";

const features = [
  {
    icon: Wand2,
    title: "AI Prompt Editing",
    description: "Type what you want — \"Remove the person behind me\" or \"Make the sky sunset\" — and AI applies it instantly.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Layers,
    title: "Editable AI Layers",
    description: "Every AI edit becomes a separate layer you can toggle, adjust, or delete. Full non-destructive workflow.",
    color: "text-studio-blue",
    bgColor: "bg-studio-blue/10",
  },
  {
    icon: CloudSun,
    title: "AI Sky Replacement",
    description: "Automatically detect and replace skies with stunning alternatives. Sunset, storm, night sky — you name it.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: UserCheck,
    title: "AI Face Enhancement",
    description: "Enhance portraits with AI-powered skin smoothing, lighting correction, and detail recovery.",
    color: "text-studio-green",
    bgColor: "bg-studio-green/10",
  },
  {
    icon: Image,
    title: "Background Removal",
    description: "One-click background removal with pixel-perfect edge detection. Works on complex hair and transparency.",
    color: "text-studio-blue",
    bgColor: "bg-studio-blue/10",
  },
  {
    icon: Palette,
    title: "AI Color Grading",
    description: "Professional color grading powered by AI. Match the look of any reference image or cinematic style.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Film,
    title: "Video Timeline Editor",
    description: "Multi-track video editing with trim, cut, transitions, and text overlays. Professional NLE in your browser.",
    color: "text-studio-blue",
    bgColor: "bg-studio-blue/10",
  },
  {
    icon: Subtitles,
    title: "AI Subtitle Generator",
    description: "Automatically generate accurate subtitles from speech. Multi-language support with customizable styling.",
    color: "text-studio-green",
    bgColor: "bg-studio-green/10",
  },
  {
    icon: Scissors,
    title: "Auto Scene Detection",
    description: "AI detects scene changes and suggests optimal cut points. Perfect for creating highlights and reels.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Sparkles,
    title: "AI Object Removal",
    description: "Remove unwanted objects, people, or distractions from any image. AI fills in the background seamlessly.",
    color: "text-studio-green",
    bgColor: "bg-studio-green/10",
  },
  {
    icon: Zap,
    title: "Auto Enhance",
    description: "One-click AI enhancement that adjusts exposure, contrast, color balance, and sharpness to perfection.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Volume2,
    title: "Audio Track Support",
    description: "Import, layer, and mix audio tracks. AI-powered noise reduction and volume normalization built in.",
    color: "text-studio-blue",
    bgColor: "bg-studio-blue/10",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/50 to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-widest text-primary mb-3"
          >
            Powerful Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
          >
            Everything You Need to Create
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            From one-click AI edits to professional manual tools, AI Creative Studio has every feature
            you need for photos and videos.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              <div className={`w-10 h-10 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
