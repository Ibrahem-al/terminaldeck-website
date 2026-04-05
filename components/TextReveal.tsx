"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface TextRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export function TextReveal({
  children,
  className = "",
  delay = 0,
  as = "p",
}: TextRevealProps) {
  const Tag = motion.create(as);

  return (
    <span className="block overflow-hidden">
      <Tag
        className={className}
        initial={{ y: "110%", opacity: 0, rotateX: 40 }}
        whileInView={{ y: "0%", opacity: 1, rotateX: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{
          duration: 0.7,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ transformOrigin: "bottom center", display: "block" }}
      >
        {children}
      </Tag>
    </span>
  );
}

// Splits text into words and animates each word with staggered delay
export function WordReveal({
  text,
  className = "",
  baseDelay = 0,
  wordDelay = 0.04,
}: {
  text: string;
  className?: string;
  baseDelay?: number;
  wordDelay?: number;
}) {
  const words = text.split(" ");

  return (
    <span className={`inline-flex flex-wrap gap-x-[0.3em] ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span
            className="inline-block"
            initial={{ y: "120%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.5,
              delay: baseDelay + i * wordDelay,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
