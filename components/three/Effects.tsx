"use client";

import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";

/**
 * Kept deliberately restrained — enough bloom to make a lit edge glow, not so
 * much that text sitting over the canvas stops being readable.
 *
 * Chromatic aberration used to be here and has been removed. The brand is navy
 * and metal and nothing else, and aberration works by separating the red and
 * blue channels — it manufactures a hue at every high-contrast edge on screen,
 * which on a blue-dominant image comes out magenta. Measuring the rendered
 * frame put it at half a per cent of lit pixels sitting outside the navy-steel
 * band, all of it from this one effect. There is no amount of it that is
 * correct on a two-tone palette; the honest setting is off.
 *
 * Bloom is safe by contrast: it spreads a highlight without inventing a colour,
 * so a silver specular blooms silver.
 */
export default function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        intensity={0.46}
        luminanceThreshold={0.32}
        luminanceSmoothing={0.3}
      />
      <Vignette eskil={false} offset={0.26} darkness={0.68} />
    </EffectComposer>
  );
}
