import {
  DataTexture,
  RGBAFormat,
  RepeatWrapping,
  LinearMipmapLinearFilter,
  LinearFilter,
} from "three";

/**
 * The one thing that separates rendered metal from real metal.
 *
 * A surface with a single roughness number reflects the room perfectly evenly,
 * and the eye reads that instantly as computer graphics — real metal is milled,
 * handled and imperfect, so its reflections break up and wander across the
 * surface. This is a tileable noise field used as a roughness map: the material
 * keeps its roughness value as an overall level, and this modulates it, so
 * highlights stretch and pinch the way they do on a real machined part.
 *
 * Fractal value noise rather than plain random. Plain per-pixel noise is white
 * noise, which at this scale just reads as dirt; summing octaves gives large
 * soft variation with fine detail inside it, which is what a brushed or milled
 * surface actually looks like.
 *
 * Generated once at module scope and shared by every material on the page —
 * 256×256 single-channel is 64KB, and re-generating it per scene would be four
 * copies of the same bytes on the GPU.
 */

const SIZE = 256;

/** Deterministic hash, so the texture is identical on every load. */
function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/** Value noise: hash on a lattice, smoothly interpolated between points. */
function valueNoise(x: number, y: number, period: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;

  // Smoothstep on the fraction, or the lattice shows up as visible squares.
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);

  // Wrapping the lattice coordinates is what makes the texture tileable; without
  // it the seam is a hard line straight down the middle of the object.
  const wrap = (n: number) => ((n % period) + period) % period;

  const a = hash(wrap(xi), wrap(yi));
  const b = hash(wrap(xi + 1), wrap(yi));
  const c = hash(wrap(xi), wrap(yi + 1));
  const d = hash(wrap(xi + 1), wrap(yi + 1));

  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

let cached: DataTexture | null = null;

export function metalRoughnessMap(): DataTexture {
  if (cached) return cached;

  // RGBA, with the same value written to every channel.
  //
  // This matters more than it looks. three reads roughnessMap from the GREEN
  // channel (and metalnessMap from blue, occlusion from red) — the glTF
  // convention of packing three maps into one texture. A single-channel RedFormat
  // texture therefore delivers green = 0, which is roughness 0: a flawless mirror
  // reflecting a nearly black room, so every metal surface on the page rendered
  // black. Writing all four channels makes the texture correct whichever slot it
  // is plugged into.
  const data = new Uint8Array(SIZE * SIZE * 4);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let value = 0;
      let amplitude = 0.5;
      let period = 4;

      // Four octaves. Beyond that the detail is finer than a screen pixel at
      // any size this renders at, so it costs generation time and shows nothing.
      for (let octave = 0; octave < 4; octave++) {
        value +=
          valueNoise((x / SIZE) * period, (y / SIZE) * period, period) * amplitude;
        amplitude *= 0.5;
        period *= 2;
      }

      // A narrow band near the top. Roughness multiplies, so this only ever
      // makes a surface smoother than its base value, never rougher — and the
      // band is deliberately shallow. Widened, the variation stops reading as
      // the grain of a machined part and starts reading as a pattern printed
      // on it.
      const level = 0.82 + value * 0.18;
      const byte = Math.round(Math.min(1, level) * 255);
      const i = (y * SIZE + x) * 4;
      data[i] = byte;
      data[i + 1] = byte;
      data[i + 2] = byte;
      data[i + 3] = 255;
    }
  }

  const texture = new DataTexture(data, SIZE, SIZE, RGBAFormat);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  // Tiled small. At three repeats the noise cells were nearly a centimetre
  // across on screen and the tiling was legible as a dimpled grid; at eight the
  // same field reads as micro-texture, which is what it is meant to be.
  texture.repeat.set(8, 8);
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 4;
  texture.needsUpdate = true;

  cached = texture;
  return texture;
}
