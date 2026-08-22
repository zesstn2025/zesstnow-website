"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { palette } from "./palette";

/**
 * The lighting rig, rendered inside every View.
 *
 * It has to be inside each one. drei's `View` gives its children their own
 * scene so that several viewports can be drawn into one canvas, and
 * `scene.environment` does not cross that boundary — an `<Environment>` placed
 * beside `<View.Port />` lights nothing. The first pass had it there, and every
 * metallic object rendered pure black: with metalness at 1 a surface has no
 * diffuse colour of its own, so with nothing to reflect there is nothing to
 * see. `frames={1}` means the cubemap is rendered once and then reused, so
 * repeating the rig per view costs a one-time render each, not a per-frame one.
 *
 * Area lights rather than an HDRI file, because drei's presets are fetched from
 * a CDN at runtime and nothing here should depend on a third-party host. These
 * four rectangles are literally what the chrome reflects, so their shape is the
 * material: hard-edged softboxes read as a photographer's studio, which is the
 * look being aimed at.
 */
export default function Studio() {
  return (
    <>
      {/* Ambient stays low. It is the one light with no direction, and every
          unit of it flattens the form it falls on. */}
      <ambientLight intensity={0.25} />
      <directionalLight position={[-5, 5, 4]} intensity={1.1} color={palette.specular} />

      <Environment frames={1} resolution={512}>
        {/* Key — a tall softbox to the upper left. The brightest source, and
            the one that draws the long highlight down a curved surface. */}
        <Lightformer
          intensity={4.2}
          color={palette.specular}
          position={[-5, 4, 3]}
          scale={[6, 9, 1]}
          form="rect"
        />
        {/* Fill — broad and weak, opposite the key, so the shadow side keeps
            detail instead of crushing to black. */}
        <Lightformer
          intensity={0.9}
          color={palette.fill}
          position={[5, -1.5, 2]}
          scale={[8, 6, 1]}
          form="rect"
        />
        {/* Kicker — a narrow strip behind the subject. This is the line of
            light along the far edge that separates metal from the void. */}
        <Lightformer
          intensity={2.6}
          color={palette.silver}
          position={[0, 3.5, -5]}
          scale={[11, 1.2, 1]}
          form="rect"
        />
        {/* Floor bounce — dim and cool, so the underside picks up the room
            rather than reading as a hole cut in the object. */}
        <Lightformer
          intensity={0.7}
          color={palette.slate}
          position={[0, -5, 1]}
          scale={[9, 3, 1]}
          form="rect"
        />

        {/* Four narrow strips, angled across the room.

            These are here purely to be reflected. A chrome surface shows the
            room and nothing else, so a studio of four broad panels gives it
            four soft gradients and very little to read as shape. Thin strips
            return the long, travelling streaks that say "polished" — they are
            the difference between a surface that looks metallic and one that
            looks like a grey ball. */}
        {[
          { pos: [-3.4, 2.6, 4], rot: [0, 0, 0.5], scale: [0.28, 7, 1] },
          { pos: [3.6, 1.4, 3.4], rot: [0, 0, -0.36], scale: [0.2, 6, 1] },
          { pos: [-1.4, -3.4, 3.6], rot: [0, 0, 1.25], scale: [0.16, 5, 1] },
          { pos: [2.2, 4.2, 1.4], rot: [0, 0, 1.5], scale: [0.14, 5.5, 1] },
        ].map((strip, i) => (
          <Lightformer
            key={i}
            intensity={3.2 - i * 0.5}
            color={palette.specular}
            position={strip.pos as [number, number, number]}
            rotation={strip.rot as [number, number, number]}
            scale={strip.scale as [number, number, number]}
            form="rect"
          />
        ))}
      </Environment>
    </>
  );
}
