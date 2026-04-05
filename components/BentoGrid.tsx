"use client";

import { motion } from "framer-motion";
import {
  Command,
  Search,
  LayoutGrid,
  Save,
  ArrowLeftRight,
  Bell,
  Palette,
  Terminal,
} from "lucide-react";
import { BENTO_FEATURES } from "@/lib/constants";
import { ScrollReveal } from "./ScrollReveal";

const ICON_MAP: Record<string, React.ElementType> = {
  command: Command,
  search: Search,
  "layout-grid": LayoutGrid,
  save: Save,
  "arrow-left-right": ArrowLeftRight,
  bell: Bell,
  palette: Palette,
  terminal: Terminal,
};

function BentoCard({
  title,
  description,
  icon,
  size,
  index,
}: {
  title: string;
  description: string;
  icon: string;
  size: string;
  index: number;
}) {
  const Icon = ICON_MAP[icon] ?? Terminal;

  return (
    <ScrollReveal delay={index * 0.08} className={size === "wide" ? "md:col-span-2" : ""}>
      <motion.div
        className="group relative rounded-2xl p-6 h-full cursor-default"
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
      >
        <div className="flex items-start gap-4">
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
          <div>
            <h3 className="font-semibold text-text-primary mb-1.5 group-hover:text-accent transition-colors duration-200">
              {title}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Subtle gradient glow on hover */}
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
  return (
    <section className="relative py-28 px-6 lg:px-8">
      {/* Background accent */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.06] pointer-events-none"
        style={{ background: "#4a9eff" }}
      />

      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2
              className="font-bold tracking-tight text-text-primary mb-4"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              And so much more.
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              Every detail designed for developers who demand the best from their tools.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BENTO_FEATURES.map((feature, i) => (
            <BentoCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              size={feature.size}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
