"use client";

import { useReveal } from "@/lib/motion";

/** Mount once per page — wires every `.reveal` element to the scroll observer. */
export default function RevealObserver() {
  useReveal();
  return null;
}
