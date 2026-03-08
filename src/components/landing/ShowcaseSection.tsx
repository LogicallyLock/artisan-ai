import { motion } from "framer-motion";
import beforeAfter from "@/assets/before-after.jpg";
import videoEditing from "@/assets/video-editing.jpg";

export function ShowcaseSection() {
  return (
    <section id="showcase" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">See it in Action</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            AI That Actually Delivers
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            99% accuracy on every edit. No more trial and error — get exactly what you asked for, every time.
          </p>
        </div>

        {/* Before/After */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="rounded-2xl overflow-hidden border border-border shadow-xl">
            <img
              src={beforeAfter}
              alt="Before and after AI photo enhancement comparison"
              className="w-full"
              loading="lazy"
            />
          </div>
          <div className="flex items-center justify-center gap-8 mt-4 text-sm text-muted-foreground">
            <span>← Original</span>
            <span className="text-primary font-medium">AI Enhanced →</span>
          </div>
        </motion.div>

        {/* Video editing showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-studio-blue mb-3">Video Editing</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Built for YouTubers, Filmmakers & Creators
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Multi-track timeline, AI subtitle generation, auto scene detection, and intelligent color grading.
              Everything you need to create professional-quality content without the learning curve.
            </p>
            <ul className="space-y-3">
              {[
                "AI-powered auto highlight reels for shorts & reels",
                "One-click cinematic color grading with 50+ LUT presets",
                "Real-time audio sync and noise reduction",
                "Export in 1080p MP4 with GPU acceleration",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-secondary-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden border border-border shadow-xl"
          >
            <img
              src={videoEditing}
              alt="Professional video editing timeline with AI-powered features"
              className="w-full"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
