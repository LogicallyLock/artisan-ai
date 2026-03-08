import { ArrowLeft, MapPin, Briefcase, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";

const openings = [
  { title: "Senior AI/ML Engineer", team: "AI Research", location: "Remote", type: "Full-time", desc: "Build and optimize our core AI image editing models. Experience with diffusion models and computer vision required." },
  { title: "Frontend Engineer (React)", team: "Product", location: "Remote / SF", type: "Full-time", desc: "Craft beautiful, performant UI for our creative studio. Deep React, TypeScript, and Canvas/WebGL experience." },
  { title: "Backend Engineer", team: "Infrastructure", location: "Remote", type: "Full-time", desc: "Scale our real-time collaboration and AI inference infrastructure. Experience with edge functions and WebSockets." },
  { title: "Product Designer", team: "Design", location: "Remote / NYC", type: "Full-time", desc: "Design intuitive creative tools that feel native to professional workflows. Figma expertise required." },
  { title: "Developer Advocate", team: "Community", location: "Remote", type: "Full-time", desc: "Build tutorials, demos, and community content. Strong technical writing and video creation skills." },
  { title: "Growth Marketing Manager", team: "Marketing", location: "Remote", type: "Full-time", desc: "Drive user acquisition for our creative platform. Experience in PLG and creator economy." },
];

const perks = ["Unlimited PTO", "Remote-first", "Latest hardware", "Learning budget", "Health & dental", "Equity options"];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <div className="max-w-5xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-4">Join Our Team</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Help us build the future of AI-powered creative tools. We're a remote-first team of builders, designers, and dreamers.
          </p>
        </motion.div>

        {/* Perks */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-2 mb-12">
          {perks.map((p) => (
            <span key={p} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{p}</span>
          ))}
        </motion.div>

        {/* Openings */}
        <h2 className="text-xl font-bold text-foreground mb-4">Open Positions</h2>
        <div className="space-y-3">
          {openings.map((job, i) => (
            <motion.div
              key={job.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.04 }}
              className="group bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{job.desc}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] flex items-center gap-1 text-muted-foreground"><Briefcase className="w-3 h-3" />{job.team}</span>
                  <span className="text-[10px] flex items-center gap-1 text-muted-foreground"><MapPin className="w-3 h-3" />{job.location}</span>
                  <span className="text-[10px] flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3" />{job.type}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">Don't see a role that fits? We're always looking for talented people.</p>
          <a href="mailto:careers@aicreativestudio.com" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Sparkles className="w-4 h-4" /> Send Open Application
          </a>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
