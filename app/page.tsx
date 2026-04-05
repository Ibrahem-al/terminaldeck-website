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
import { Preloader } from "@/components/Preloader";
import { ScrollFloat } from "@/components/ScrollFloat";

export default function Home() {
  return (
    <>
      <Preloader />
      <NoiseOverlay />
      <ScrollFloat />
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <FeatureShowcase />
        <BentoGrid />
        <ComparisonTable />
        <HowItWorks />
        <DownloadCTA />
      </main>
      <Footer />
    </>
  );
}
