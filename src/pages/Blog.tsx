import { ArrowLeft, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";

const posts = [
  { title: "Introducing AI Creative Studio 2.0", excerpt: "We're excited to launch our biggest update yet — featuring real-time collaboration, a template gallery, and advanced AI editing powered by Gemini.", date: "Mar 5, 2026", tag: "Product" },
  { title: "How AI is Changing Photo Editing Forever", excerpt: "From automatic sky replacement to intelligent object removal, discover how machine learning is revolutionizing the creative workflow.", date: "Feb 28, 2026", tag: "AI" },
  { title: "5 Color Grading Tips for Cinematic Videos", excerpt: "Professional colorists share their secrets for achieving that Hollywood look using our built-in filters and presets.", date: "Feb 20, 2026", tag: "Tutorial" },
  { title: "Behind the Scenes: Building Real-Time Collaboration", excerpt: "Our engineering team explains the technical challenges of building a real-time collaborative editing platform.", date: "Feb 14, 2026", tag: "Engineering" },
  { title: "Template Gallery: 50+ Professional Designs", excerpt: "Browse our curated collection of templates for social media, print, video, and creative projects.", date: "Feb 8, 2026", tag: "Product" },
  { title: "The Future of Content Creation with AI", excerpt: "Our vision for the next generation of creative tools — where AI assists and humans create.", date: "Jan 30, 2026", tag: "Vision" },
];

const TAG_COLORS: Record<string, string> = {
  Product: "bg-primary/10 text-primary",
  AI: "bg-accent/10 text-accent",
  Tutorial: "bg-[hsl(var(--studio-accent-green))]/10 text-[hsl(var(--studio-accent-green))]",
  Engineering: "bg-secondary text-secondary-foreground",
  Vision: "bg-primary/10 text-primary",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-4">Blog</h1>
          <p className="text-lg text-muted-foreground">News, tutorials, and insights from the AI Creative Studio team.</p>
        </motion.div>

        <div className="space-y-6">
          {posts.map((post, i) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TAG_COLORS[post.tag] || "bg-secondary text-secondary-foreground"}`}>{post.tag}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {post.date}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{post.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
            </motion.article>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
