import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TerminalDeck — See All Your Terminals at Once",
  description:
    "The spatial terminal workspace for developers. Arrange, organize, and manage multiple terminal sessions on an infinite canvas. Free for Windows and macOS.",
  keywords: [
    "terminal",
    "workspace",
    "developer tools",
    "spatial canvas",
    "terminal manager",
    "AI terminal",
    "multiple terminals",
  ],
  authors: [{ name: "TerminalDeck" }],
  openGraph: {
    title: "TerminalDeck — See All Your Terminals at Once",
    description:
      "The spatial terminal workspace for developers. Arrange multiple terminal sessions on an infinite canvas.",
    type: "website",
    locale: "en_US",
    siteName: "TerminalDeck",
  },
  twitter: {
    card: "summary_large_image",
    title: "TerminalDeck — See All Your Terminals at Once",
    description:
      "The spatial terminal workspace for developers. Arrange multiple terminal sessions on an infinite canvas.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
