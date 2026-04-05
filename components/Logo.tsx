export function Logo({ className = "", size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="TerminalDeck logo"
    >
      {/* Background rounded square */}
      <rect x="2" y="2" width="60" height="60" rx="14" fill="#0f0f1a" stroke="#2a2a44" strokeWidth="2" />

      {/* Grid dots representing the spatial canvas */}
      <circle cx="16" cy="16" r="1.5" fill="#2a2a44" />
      <circle cx="28" cy="16" r="1.5" fill="#2a2a44" />
      <circle cx="40" cy="16" r="1.5" fill="#2a2a44" />
      <circle cx="52" cy="16" r="1.5" fill="#2a2a44" />
      <circle cx="16" cy="28" r="1.5" fill="#2a2a44" />
      <circle cx="52" cy="28" r="1.5" fill="#2a2a44" />
      <circle cx="16" cy="40" r="1.5" fill="#2a2a44" />
      <circle cx="52" cy="40" r="1.5" fill="#2a2a44" />
      <circle cx="16" cy="52" r="1.5" fill="#2a2a44" />
      <circle cx="28" cy="52" r="1.5" fill="#2a2a44" />
      <circle cx="40" cy="52" r="1.5" fill="#2a2a44" />
      <circle cx="52" cy="52" r="1.5" fill="#2a2a44" />

      {/* Terminal panel 1 (top-left) */}
      <rect x="12" y="20" width="20" height="14" rx="3" fill="#1a1a2e" stroke="#4a9eff" strokeWidth="1.5" />
      <circle cx="16" cy="24" r="1.5" fill="#22c55e" />
      <rect x="20" y="23" width="8" height="1.5" rx="0.75" fill="#8888aa" />
      <rect x="15" y="28" width="6" height="1" rx="0.5" fill="#4a9eff" opacity="0.6" />
      <rect x="23" y="28" width="4" height="1" rx="0.5" fill="#8888aa" opacity="0.4" />
      <rect x="15" y="31" width="10" height="1" rx="0.5" fill="#8888aa" opacity="0.3" />

      {/* Terminal panel 2 (top-right, slightly overlapping) */}
      <rect x="30" y="14" width="22" height="16" rx="3" fill="#1a1a2e" stroke="#4a9eff" strokeWidth="1.5" />
      <circle cx="34" cy="18" r="1.5" fill="#4a9eff" />
      <rect x="38" y="17" width="10" height="1.5" rx="0.75" fill="#8888aa" />
      <rect x="33" y="22" width="8" height="1" rx="0.5" fill="#22c55e" opacity="0.6" />
      <rect x="33" y="25" width="14" height="1" rx="0.5" fill="#8888aa" opacity="0.4" />

      {/* Terminal panel 3 (bottom, wider) */}
      <rect x="18" y="36" width="30" height="16" rx="3" fill="#1a1a2e" stroke="#4a9eff" strokeWidth="1.5" />
      <circle cx="22" cy="40" r="1.5" fill="#eab308" />
      <rect x="26" y="39" width="12" height="1.5" rx="0.75" fill="#8888aa" />
      <rect x="21" y="44" width="5" height="1" rx="0.5" fill="#4a9eff" opacity="0.5" />
      <rect x="28" y="44" width="16" height="1" rx="0.5" fill="#8888aa" opacity="0.4" />
      <rect x="21" y="47" width="22" height="1" rx="0.5" fill="#8888aa" opacity="0.3" />

      {/* Snap guide line */}
      <line x1="32" y1="10" x2="32" y2="54" stroke="#4a9eff" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.3" />
    </svg>
  );
}
