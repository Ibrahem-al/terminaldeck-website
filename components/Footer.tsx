"use client";

import { Logo } from "./Logo";
import { ScrollReveal } from "./ScrollReveal";

const LINK_GROUPS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Download", href: "#download" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "Deployment Guide", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Privacy", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer
      className="relative py-16 px-6 lg:px-8 border-t"
      style={{
        background: "#060612",
        borderColor: "#2a2a44",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <ScrollReveal delay={0}>
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <Logo size={24} />
                <span className="font-mono text-sm font-semibold text-text-primary">
                  TerminalDeck
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Built for developers who think spatially.
              </p>
            </div>
          </ScrollReveal>

          {/* Link columns */}
          {LINK_GROUPS.map((group, i) => (
            <ScrollReveal key={group.title} delay={0.08 * (i + 1)}>
              <div>
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
                  {group.title}
                </h4>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200 cursor-pointer"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Bottom bar */}
        <ScrollReveal delay={0.35}>
          <div
            className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderColor: "#2a2a44" }}
          >
            <p className="text-xs text-text-secondary">
              &copy; {new Date().getFullYear()} TerminalDeck. All rights reserved.
            </p>
            <p className="text-xs text-text-secondary/50">
              See all your terminals at once.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
