import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { BentoGrid } from "@/components/BentoGrid";
import { ComparisonTable } from "@/components/ComparisonTable";
import { HowItWorks } from "@/components/HowItWorks";
import { DownloadCTA } from "@/components/DownloadCTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
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
