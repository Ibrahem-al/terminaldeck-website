import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { StatsBar } from "@/components/StatsBar";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { BentoGrid } from "@/components/BentoGrid";
import { ComparisonTable } from "@/components/ComparisonTable";
import { HowItWorks } from "@/components/HowItWorks";
import { DownloadCTA } from "@/components/DownloadCTA";
import { Footer } from "@/components/Footer";
import { NoiseOverlay } from "@/components/NoiseOverlay";
import { PhotoDivider } from "@/components/PhotoDivider";

export default function Home() {
  return (
    <>
      <NoiseOverlay />
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <PhotoDivider
          src="https://images.unsplash.com/photo-1550439062-609e1531270e?w=1600&q=60"
          alt="Developer workspace with multiple monitors"
        />
        <FeatureShowcase />
        <BentoGrid />
        <PhotoDivider
          src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=1600&q=60"
          alt="Close-up of keyboard and code on screen"
        />
        <ComparisonTable />
        <HowItWorks />
        <PhotoDivider
          src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1600&q=60"
          alt="Developer multi-monitor setup"
        />
        <DownloadCTA />
      </main>
      <Footer />
    </>
  );
}
