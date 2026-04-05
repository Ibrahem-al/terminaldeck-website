"use client";

import { motion } from "framer-motion";
import { Download, FolderPlus, LayoutDashboard } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const STEPS = [
  {
    number: "01",
    title: "Download & Install",
    description: "One-click install for Windows or macOS. No account required, no setup wizards. Just download and launch.",
    icon: Download,
  },
  {
    number: "02",
    title: "Create Your Workspace",
    description: "Set up projects with color coding, working directories, and startup commands. Organize your workflow before you begin.",
    icon: FolderPlus,
  },
  {
    number: "03",
    title: "Arrange & Work",
    description: "Drag terminals onto the infinite canvas. Snap them into place, group by project, and see everything at once.",
    icon: LayoutDashboard,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <div className="text-center mb-20">
            <h2
              className="font-display font-bold tracking-tight text-text-primary mb-4"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Up and running in{" "}
              <span className="text-accent">minutes.</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              No configuration files. No complex setup. Just install and start working.
            </p>
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Connecting line */}
          <motion.div
            className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-px -translate-y-1/2"
            style={{ background: "linear-gradient(to right, transparent, #2a2a44, #4a9eff33, #2a2a44, transparent)" }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {STEPS.map((step, i) => (
              <ScrollReveal key={step.number} delay={i * 0.15}>
                <div className="relative flex flex-col items-center text-center">
                  {/* Step number badge */}
                  <div
                    className="relative mb-6 w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "#16162a",
                      border: "1px solid #2a2a44",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    }}
                  >
                    <step.icon size={24} className="text-accent" />
                    {/* Number badge */}
                    <div
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold"
                      style={{
                        background: "#4a9eff",
                        color: "#fff",
                        boxShadow: "0 0 12px rgba(74,158,255,0.4)",
                      }}
                    >
                      {step.number}
                    </div>
                  </div>

                  <h3 className="text-lg font-display font-semibold text-text-primary mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
