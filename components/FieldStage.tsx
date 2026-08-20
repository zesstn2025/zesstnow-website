"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useAllow3D, useScrollProgress } from "@/lib/motion";

const Field = dynamic(() => import("./three/Field"), { ssr: false, loading: () => null });

/**
 * The site-wide ambient canvas, mounted once in the root layout and fixed
 * behind every page.
 *
 * It sits behind all content and never takes pointer events, so the page is
 * completely usable if it never mounts — which is exactly what happens under
 * reduced motion, on weak hardware, or without WebGL.
 */
export default function FieldStage() {
  const scroll = useScrollProgress();
  const allow3D = useAllow3D();
  const [visible, setVisible] = useState(true);

  // Park the loop whenever the tab is in the background.
  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  if (!allow3D) return null;

  return (
    <div className="field-stage" aria-hidden="true">
      <Field scroll={scroll} active={visible} />
    </div>
  );
}
