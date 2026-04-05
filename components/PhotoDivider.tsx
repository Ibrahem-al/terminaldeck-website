import Image from "next/image";

interface PhotoDividerProps {
  src: string;
  alt: string;
}

export function PhotoDivider({ src, alt }: PhotoDividerProps) {
  return (
    <div className="relative w-full h-40 md:h-56 overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="100vw"
        loading="lazy"
      />
      {/* Top gradient blend */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, #0a0a16, transparent)" }}
      />
      {/* Bottom gradient blend */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
        style={{ background: "linear-gradient(to top, #0a0a16, transparent)" }}
      />
      {/* Overall darkening */}
      <div className="absolute inset-0 bg-bg-primary/40 pointer-events-none" />
    </div>
  );
}
