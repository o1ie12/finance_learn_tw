"use client";

import { useEffect } from "react";
import { isLowEnd } from "@/lib/design/lowend";

/** Sets data-lowend on <html> once, on the client (06 E17). */
export function LowEndFlag() {
  useEffect(() => {
    if (isLowEnd(navigator)) document.documentElement.setAttribute("data-lowend", "");
  }, []);
  return null;
}
