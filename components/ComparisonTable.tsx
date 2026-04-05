"use client";

import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";
import { COMPARISON_DATA } from "@/lib/constants";
import { ScrollReveal } from "./ScrollReveal";

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <div className="flex items-center justify-center">
        <div className="p-1 rounded-full" style={{ background: "rgba(34,197,94,0.15)" }}>
          <Check size={14} className="text-accent-green" />
        </div>
      </div>
    );
  }
  if (value === "partial") {
    return (
      <div className="flex items-center justify-center">
        <div className="p-1 rounded-full" style={{ background: "rgba(234,179,8,0.15)" }}>
          <Minus size={14} className="text-accent-yellow" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center">
      <div className="p-1 rounded-full" style={{ background: "rgba(136,136,170,0.1)" }}>
        <X size={14} className="text-text-secondary/40" />
      </div>
    </div>
  );
}

export function ComparisonTable() {
  return (
    <section id="compare" className="relative py-28 px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2
              className="font-bold tracking-tight text-text-primary mb-4"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Why <span className="text-accent">TerminalDeck</span>?
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              The features you need, that no other terminal offers.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full border-collapse min-w-[640px]">
              <thead>
                <tr>
                  <th className="text-left text-sm font-medium text-text-secondary py-4 px-4 w-48">
                    Feature
                  </th>
                  {COMPARISON_DATA.competitors.map((comp) => (
                    <th
                      key={comp.name}
                      className="text-center text-sm font-semibold py-4 px-3"
                      style={{
                        color: comp.highlight ? "#4a9eff" : "#8888aa",
                      }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {comp.name}
                        {comp.highlight && (
                          <div className="w-full h-0.5 rounded-full bg-accent" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DATA.features.map((feature, rowIdx) => (
                  <motion.tr
                    key={feature}
                    className="border-t"
                    style={{ borderColor: "#2a2a44" }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: rowIdx * 0.06, duration: 0.4 }}
                  >
                    <td className="text-sm text-text-primary py-3.5 px-4">
                      {feature}
                    </td>
                    {COMPARISON_DATA.competitors.map((comp) => (
                      <td
                        key={comp.name}
                        className="py-3.5 px-3"
                        style={{
                          background: comp.highlight ? "rgba(74,158,255,0.03)" : "transparent",
                        }}
                      >
                        <CellValue value={comp.values[rowIdx]} />
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
