import { ArrowLeft, Target, Users, Sparkles, Heart, Globe, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";

const values = [
  { icon: Sparkles, title: "AI-First Innovation", desc: "We push the boundaries of what's possible by putting AI at the core of every creative tool we build." },
  { icon: Users, title: "Creator-Centric Design", desc: "Every feature is designed with real creators in mind — from hobbyists to professional studios." },
  { icon: Globe, title: "Accessible Creativity", desc: "We believe professional-grade editing tools should be available to everyone, everywhere." },
  { icon: Heart, title: "Community Driven", desc: "Our roadmap is shaped by our community. We listen, iterate, and build what creators actually need." },
];

const stats = [
  { value: "500K+", label: "Active Creators" },
  { value: "10M+", label: "Images Edited" },
  { value: "50+", label: "AI Models" },
  { value: "190", label: "Countries" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <div className="max-w-5xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-4">About AI Creative Studio</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            We're building the future of creative tools — where AI amplifies human creativity instead of replacing it.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-16">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Our Mission</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              AI Creative Studio was founded in 2024 with a simple belief: the best creative tools should understand what you want to create. By combining cutting-edge AI models with intuitive design, we empower creators to focus on their vision — not the technical details. From removing objects with a text prompt to real-time collaborative editing, we're reimagining what a creative suite can be.
            </p>
          </div>
        </motion.section>

        {/* Stats */}
        <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-6 text-center">
                <p className="text-3xl font-bold text-primary mb-1">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Values */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
