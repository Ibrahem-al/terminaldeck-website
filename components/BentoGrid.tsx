"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Command,
  Search,
  LayoutGrid,
  Save,
  ArrowLeftRight,
  Bell,
  Palette,
  Terminal,
  X,
} from "lucide-react";
import { BENTO_FEATURES } from "@/lib/constants";
import { ScrollReveal } from "./ScrollReveal";
import { TextReveal } from "./TextReveal";
import { Parallax } from "./Parallax";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  command: Command,
  search: Search,
  "layout-grid": LayoutGrid,
  save: Save,
  "arrow-left-right": ArrowLeftRight,
  bell: Bell,
  palette: Palette,
  terminal: Terminal,
};

const CARD_BACKGROUNDS: Record<string, string> = {
  "Command Palette": "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&q=30",
  "Global Search": "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&q=30",
  "Layout Presets": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=30",
  "Full Persistence": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=30",
  "Import / Export": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=30",
  "Smart Notifications": "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=600&q=30",
  "Theming": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=30",
  "Startup Commands": "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&q=30",
};

type BentoFeature = (typeof BENTO_FEATURES)[number];

function FeatureModal({
  feature,
  onClose,
}: {
  feature: BentoFeature;
  onClose: () => void;
}) {
  const Icon = ICON_MAP[feature.icon as string] ?? Terminal;
  const bgImage = CARD_BACKGROUNDS[feature.title];

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm" />

      {/* Modal card */}
      <motion.div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: "#16162a",
          border: "1px solid #2a2a44",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(74,158,255,0.08)",
        }}
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 10, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background photo */}
        {bgImage && (
          <div
            className="absolute inset-0 opacity-[0.06] bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-panel/50 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="relative p-8">
          {/* Icon + title */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="p-3 rounded-xl"
              style={{ background: "#4a9eff12", border: "1px solid #4a9eff30" }}
            >
              <Icon size={24} className="text-accent" />
            </div>
            <h3 className="text-xl font-display font-bold text-text-primary">
              {feature.title}
            </h3>
          </div>

          {/* Full description */}
          <p className="text-sm text-text-secondary leading-relaxed">
            {feature.detail}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function BentoCard({
  feature,
  index,
  onSelect,
}: {
  feature: BentoFeature;
  index: number;
  onSelect: () => void;
}) {
  const Icon = ICON_MAP[feature.icon] ?? Terminal;
  const bgImage = CARD_BACKGROUNDS[feature.title];

  return (
    <ScrollReveal delay={index * 0.08} className={feature.size === "wide" ? "md:col-span-2" : ""}>
      <motion.div
        className="group relative rounded-2xl p-6 h-full cursor-pointer overflow-hidden"
        style={{
          background: "#16162a",
          border: "1px solid #2a2a44",
        }}
        whileHover={{
          scale: 1.02,
          borderColor: "rgba(74,158,255,0.4)",
          boxShadow: "0 8px 30px rgba(74,158,255,0.1), 0 0 0 1px rgba(74,158,255,0.15)",
        }}
        transition={{ duration: 0.2 }}
        onClick={onSelect}
      >
        {bgImage && (
          <div
            className="absolute inset-0 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500 pointer-events-none bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        )}

        <div className="relative flex items-start gap-4">
          <div
            className="p-2.5 rounded-xl transition-colors duration-200"
            style={{
              background: "#0f0f1a",
              border: "1px solid #2a2a44",
            }}
          >
            <Icon
              size={20}
              className="text-text-secondary group-hover:text-accent transition-colors duration-200"
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-mono font-semibold text-text-primary mb-1.5 group-hover:text-accent transition-colors duration-200">
              {feature.title}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {feature.description}
            </p>
            <p className="text-[10px] font-mono text-accent/50 mt-2 group-hover:text-accent/80 transition-colors">
              Click to learn more
            </p>
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(74,158,255,0.04), transparent 70%)",
          }}
        />
      </motion.div>
    </ScrollReveal>
  );
}

export function BentoGrid() {
  const [selected, setSelected] = useState<BentoFeature | null>(null);

  return (
    <section className="relative py-28 px-6 lg:px-8">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.06] pointer-events-none"
        style={{ background: "#4a9eff" }}
      />

      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <TextReveal as="h2" className="font-display font-bold tracking-tight text-text-primary mb-4" delay={0}>
            <span style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>And so much more.</span>
          </TextReveal>
          <TextReveal as="p" className="text-text-secondary text-lg max-w-xl mx-auto" delay={0.12}>
            Every detail designed for developers who demand the best from their tools.
          </TextReveal>
        </div>

        <Parallax speed={-0.08}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BENTO_FEATURES.map((feature, i) => (
            <BentoCard
              key={feature.title}
              feature={feature}
              index={i}
              onSelect={() => setSelected(feature)}
            />
          ))}
        </div>
        </Parallax>
      </div>

      {/* Feature detail modal */}
      <AnimatePresence>
        {selected && (
          <FeatureModal
            feature={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
