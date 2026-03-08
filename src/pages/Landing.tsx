import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { ShowcaseSection } from "@/components/landing/ShowcaseSection";
import { CreatorsSection } from "@/components/landing/CreatorsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <ShowcaseSection />
      <CreatorsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}
