"use client";

import { useMemo } from "react";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";
import { Vector2 } from "three";

/**
 * Kept deliberately restrained — enough bloom to make the emissive edges feel
 * lit, not so much that text sitting over the canvas stops being readable.
 */
export default function Effects() {
  const offset = useMemo(() => new Vector2(0.0006, 0.0009), []);

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        intensity={0.42}
        luminanceThreshold={0.3}
        luminanceSmoothing={0.3}
      />
      <ChromaticAberration
        offset={offset}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette eskil={false} offset={0.26} darkness={0.68} />
    </EffectComposer>
  );
}
