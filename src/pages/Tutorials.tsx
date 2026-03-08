import { ArrowLeft, BookOpen, Play, Code, Lightbulb, Palette, Film, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";

const tutorials = [
  { icon: Palette, title: "Getting Started with Photo Editing", desc: "Learn the basics of the AI-powered photo editor — import, adjust, and export your first image.", duration: "5 min", level: "Beginner" },
  { icon: Wand2, title: "AI Prompt Editing Masterclass", desc: "Discover how to use natural language prompts to transform your images with AI.", duration: "8 min", level: "Intermediate" },
  { icon: Film, title: "Video Editing Fundamentals", desc: "Timeline basics, cutting clips, adding audio tracks, and rendering your first video.", duration: "12 min", level: "Beginner" },
  { icon: Code, title: "Advanced Filters & Presets", desc: "Create cinematic looks using the Filters panel — blur, vignette, grain, and color grading.", duration: "6 min", level: "Intermediate" },
  { icon: Lightbulb, title: "Collaboration & Sharing", desc: "Invite team members, work in real-time, and share projects with collaborators.", duration: "4 min", level: "Beginner" },
  { icon: BookOpen, title: "Exporting for Social Media", desc: "Optimize your exports for Instagram, YouTube, TikTok, and other platforms.", duration: "5 min", level: "Beginner" },
  { icon: Wand2, title: "AI Sky Replacement", desc: "Use AI to detect and replace skies in landscape photos with a single prompt.", duration: "7 min", level: "Advanced" },
  { icon: Palette, title: "Color Grading for Film", desc: "Professional color grading workflows for cinematic video projects.", duration: "15 min", level: "Advanced" },
];

export default function TutorialsPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <div className="max-w-5xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-4">Tutorials</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Learn everything from basic photo edits to advanced AI-powered workflows.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutorials.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <t.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{t.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{t.desc}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{t.level}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Play className="w-3 h-3" /> {t.duration}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
