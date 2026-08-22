"use client";

import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { MathUtils } from "three";
import Core from "./Core";
import Satellites from "./Satellites";
import AuroraRibbons from "./AuroraRibbons";
import { palette } from "./palette";

type Variant = "hero" | "product";

/**
 * Drifts the camera with the pointer and pulls it back as the page scrolls, so
 * the composition opens up instead of staying pinned behind the hero copy.
 */
function CameraRig({
  scroll,
  variant,
}: {
  scroll: React.RefObject<number>;
  variant: Variant;
}) {
  useFrame((state, delta) => {
    const p = variant === "hero" ? Math.min(scroll.current * 2.4, 1) : 0;

    const targetX = state.pointer.x * 0.75;
    const targetY = 0.2 + state.pointer.y * 0.4 - p * 0.9;
    const targetZ = (variant === "hero" ? 6.6 : 5.8) + p * 2.2;

    state.camera.position.x = MathUtils.damp(state.camera.position.x, targetX, 2.6, delta);
    state.camera.position.y = MathUtils.damp(state.camera.position.y, targetY, 2.6, delta);
    state.camera.position.z = MathUtils.damp(state.camera.position.z, targetZ, 2.2, delta);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

/**
 * Lightformers instead of an HDRI preset — drei's presets are fetched from a
 * CDN at runtime, and the scene must not depend on a third-party host being up.
 *
 * One key, one fill, one kicker. The key is the only bright source and the only
 * saturated one; the fill exists solely to keep the shadow side of the glass
 * from going flat black, and stays desaturated so it never reads as a second
 * colour. This is the whole idea the design rests on — a subject is lit when
 * the light has a direction, and it has no direction when it comes from
 * everywhere at once.
 */
function Studio({ variant }: { variant: Variant }) {
  return (
    // `frames={1}`: the cubemap is rendered once and reused. Left live it
    // re-renders the environment every frame, which inside a shared canvas is
    // paid on top of every other view.
    <Environment frames={1} resolution={128}>
      {/* Key — upper left, dominant. The brightest thing in the scene. */}
      <Lightformer
        intensity={3.6}
        color={palette.silver}
        position={[-4.5, 3.2, 2]}
        scale={[8, 6, 1]}
        form="rect"
      />
      {/* Fill — opposite side, weak and near-neutral. */}
      <Lightformer
        intensity={0.85}
        color={palette.fill}
        position={[5, -2, 1]}
        scale={[7, 5, 1]}
        form="rect"
      />
      {/* Kicker — a thin line from behind that separates the form from the
          void. Dim; it defines an edge, it does not illuminate. */}
      <Lightformer
        intensity={1.5}
        color={palette.chrome}
        position={[0, 4.5, -4]}
        scale={[10, 1.6, 1]}
        form="rect"
      />
      {variant === "hero" && (
        <Lightformer
          intensity={0.9}
          color={palette.slate}
          position={[0, -4, 2]}
          scale={[8, 2, 1]}
          form="circle"
        />
      )}
    </Environment>
  );
}

/**
 * The hero subject, drawn into the site's one shared canvas through a `<View>`.
 *
 * It used to own a `<Canvas>` of its own, purely so it could run an
 * `EffectComposer` — postprocessing takes over the whole frame, and a `View` is
 * a scissored rectangle inside a frame shared with every other scene, so the
 * two cannot coexist. The bloom and vignette are gone and the hero keeps its
 * own canvas no longer: a subject built out of transmission glass and rim
 * light was never leaning on the bloom, and the vignette is a CSS gradient over
 * the same rectangle, which costs nothing and does not need a render pass.
 *
 * The section owns the camera, so `CameraRig` drives that one rather than a
 * canvas-wide default.
 */
export default function Scene({
  variant = "hero",
  accent = palette.silver,
  scroll,
}: {
  variant?: Variant;
  accent?: string;
  scroll: React.RefObject<number>;
}) {
  return (
    <>
      {/* Ambient is kept low on purpose: it is the one light with no direction,
          so every unit of it flattens the subject. */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[-4, 5, 3]} intensity={1.5} color={palette.silver} />
      <pointLight position={[-4, -1.5, 2]} intensity={14} color={palette.chrome} distance={14} />
      <pointLight position={[4, 2, -1]} intensity={6} color={palette.fill} distance={14} />

      <Studio variant={variant} />
      <AuroraRibbons />

      {/* The copy owns the left half on every page, so the subject sits to the
          right of it — centred, it renders straight through the headline and
          the scrim has to work far too hard. */}
      <group
        position={variant === "hero" ? [2.25, 0.15, 0] : [1.75, 0.1, 0]}
        scale={variant === "hero" ? 0.82 : 0.9}
      >
        <Core accent={accent} />
        {variant === "hero" && <Satellites />}
      </group>

      <CameraRig scroll={scroll} variant={variant} />
    </>
  );
}
