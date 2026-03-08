import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold text-foreground">AI Creative Studio</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The AI-powered creative suite for modern editors, filmmakers, and content creators.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              {["Photo Editor", "Video Editor", "AI Features", "Pricing"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-secondary-foreground hover:text-foreground transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              {["Tutorials", "Blog", "Community", "API Docs"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-secondary-foreground hover:text-foreground transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {["About", "Careers", "Privacy", "Terms"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-secondary-foreground hover:text-foreground transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2026 AI Creative Studio. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">YouTube</a>
            <a href="#" className="hover:text-foreground transition-colors">Discord</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
