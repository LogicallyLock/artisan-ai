import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";

const sections = [
  { title: "1. Information We Collect", content: "We collect information you provide directly, such as your name, email address, and profile photo when you create an account. We also collect usage data including how you interact with our tools, images you upload for editing (processed securely and not used for training), and device/browser information." },
  { title: "2. How We Use Your Information", content: "We use your information to provide and improve our services, process your edits using AI models, personalize your experience, send you updates (with your consent), and maintain security. We do not sell your personal data to third parties." },
  { title: "3. AI Processing", content: "When you use AI features, your images are temporarily processed by our AI models. Images are not stored beyond the editing session unless you explicitly save them to your project. We do not use your images to train our AI models without explicit consent." },
  { title: "4. Data Storage & Security", content: "Your data is stored securely using industry-standard encryption. Project files are stored in secure cloud storage with access controls. We implement appropriate technical and organizational measures to protect your personal information." },
  { title: "5. Cookies & Tracking", content: "We use essential cookies for authentication and session management. Analytics cookies help us understand how our tools are used. You can control cookie preferences through your browser settings." },
  { title: "6. Data Sharing", content: "We share data only with service providers who help us operate (cloud hosting, AI inference), when required by law, or with your explicit consent. Collaborators you invite can see shared project data." },
  { title: "7. Your Rights", content: "You have the right to access, correct, or delete your personal data. You can export your projects at any time. To exercise these rights, contact us at privacy@aicreativestudio.com." },
  { title: "8. Changes to This Policy", content: "We may update this policy from time to time. We'll notify you of significant changes via email or in-app notification. Continued use after changes constitutes acceptance." },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: March 1, 2026</p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <motion.section key={s.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <h2 className="text-lg font-semibold text-foreground mb-2">{s.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
            </motion.section>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12 p-5 bg-card border border-border rounded-xl">
          <p className="text-sm text-muted-foreground">
            Questions? Contact us at <a href="mailto:privacy@aicreativestudio.com" className="text-primary hover:underline">privacy@aicreativestudio.com</a>
          </p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
