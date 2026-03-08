import { ArrowLeft, Code, Copy, Check, BookOpen, Zap, Key } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";

const endpoints = [
  { method: "POST", path: "/v1/projects", desc: "Create a new project" },
  { method: "GET", path: "/v1/projects/:id", desc: "Get project details" },
  { method: "PUT", path: "/v1/projects/:id", desc: "Update project" },
  { method: "DELETE", path: "/v1/projects/:id", desc: "Delete project" },
  { method: "POST", path: "/v1/ai/edit", desc: "AI-powered image editing" },
  { method: "POST", path: "/v1/ai/generate", desc: "Generate image from prompt" },
  { method: "POST", path: "/v1/export", desc: "Export project as image/video" },
  { method: "GET", path: "/v1/templates", desc: "List available templates" },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "text-[hsl(var(--studio-accent-green))]",
  POST: "text-primary",
  PUT: "text-accent",
  DELETE: "text-destructive",
};

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="relative bg-muted rounded-lg p-4 font-mono-code text-xs text-foreground overflow-x-auto">
      <button onClick={copy} className="absolute top-2 right-2 studio-tool-btn w-7 h-7">
        {copied ? <Check className="w-3.5 h-3.5 text-[hsl(var(--studio-accent-green))]" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      <pre className="whitespace-pre">{code}</pre>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-4">API Documentation</h1>
          <p className="text-lg text-muted-foreground">Integrate AI Creative Studio into your applications.</p>
        </motion.div>

        {/* Quick start */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-primary" /> Quick Start</h2>
          <CodeBlock code={`curl -X POST https://api.aicreativestudio.com/v1/ai/edit \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://example.com/photo.jpg",
    "prompt": "Replace the sky with a dramatic sunset"
  }'`} />
        </section>

        {/* Auth */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-primary" /> Authentication</h2>
          <p className="text-sm text-muted-foreground mb-4">
            All API requests require a Bearer token. Generate your API key from the Dashboard under Settings → API Keys.
          </p>
          <CodeBlock code={`Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxxx`} />
        </section>

        {/* Endpoints */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Endpoints</h2>
          <div className="border border-border rounded-xl overflow-hidden">
            {endpoints.map((ep, i) => (
              <div key={ep.path + ep.method} className={`flex items-center gap-4 px-5 py-3 hover:bg-secondary/30 transition-colors cursor-pointer ${i < endpoints.length - 1 ? "border-b border-border" : ""}`}>
                <span className={`text-xs font-mono-code font-bold w-14 ${METHOD_COLORS[ep.method]}`}>{ep.method}</span>
                <span className="text-sm font-mono-code text-foreground flex-1">{ep.path}</span>
                <span className="text-xs text-muted-foreground">{ep.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Rate limits */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Rate Limits</h2>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">100</p>
                <p className="text-xs text-muted-foreground">Requests/min (Free)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">1,000</p>
                <p className="text-xs text-muted-foreground">Requests/min (Pro)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">10,000</p>
                <p className="text-xs text-muted-foreground">Requests/min (Team)</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
