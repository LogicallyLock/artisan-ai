import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";

const sections = [
  { title: "1. Acceptance of Terms", content: "By accessing or using AI Creative Studio, you agree to be bound by these Terms of Service. If you do not agree, you may not use our services. We may update these terms at any time — continued use constitutes acceptance." },
  { title: "2. Account Registration", content: "You must create an account to use our services. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. You must be at least 13 years old to use our services." },
  { title: "3. Acceptable Use", content: "You agree not to use our services to: create illegal or harmful content, infringe on intellectual property rights, attempt to reverse-engineer our AI models, use automated tools to scrape or abuse our API, or circumvent rate limits or usage restrictions." },
  { title: "4. Content Ownership", content: "You retain full ownership of all content you create using our tools. By uploading content, you grant us a limited license to process it for the purpose of providing our services. We do not claim ownership of your creations." },
  { title: "5. AI-Generated Content", content: "Content created or modified using our AI tools is yours to use commercially, subject to applicable laws. You are responsible for ensuring AI-generated content does not infringe on third-party rights." },
  { title: "6. Subscription & Billing", content: "Paid plans are billed monthly or annually. You may cancel at any time — access continues until the end of your billing period. Refunds are available within 14 days of initial purchase for annual plans." },
  { title: "7. Service Availability", content: "We strive for 99.9% uptime but do not guarantee uninterrupted access. We may perform maintenance with advance notice. We are not liable for losses due to service interruptions." },
  { title: "8. Limitation of Liability", content: "Our total liability is limited to the amount you paid us in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages." },
  { title: "9. Termination", content: "We may suspend or terminate your account for violation of these terms. You may delete your account at any time through Settings. Upon termination, your data will be deleted within 30 days." },
  { title: "10. Governing Law", content: "These terms are governed by the laws of the State of California, USA. Any disputes shall be resolved through binding arbitration in San Francisco, CA." },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
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

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-12 p-5 bg-card border border-border rounded-xl">
          <p className="text-sm text-muted-foreground">
            Questions? Contact us at <a href="mailto:legal@aicreativestudio.com" className="text-primary hover:underline">legal@aicreativestudio.com</a>
          </p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
