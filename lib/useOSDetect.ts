"use client";

import { useEffect, useState } from "react";

export type OS = "windows" | "mac" | "linux" | "unknown";

export function useOSDetect(): OS {
  const [os, setOS] = useState<OS>("unknown");

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("win")) setOS("windows");
    else if (ua.includes("mac")) setOS("mac");
    else if (ua.includes("linux")) setOS("linux");
  }, []);

  return os;
}
