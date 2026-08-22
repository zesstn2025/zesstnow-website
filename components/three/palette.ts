/**
 * The scene palette — one warm accent, and nothing else with a hue.
 *
 * The site used to light everything with violet and cyan at once. Two saturated
 * accents fighting across every section is what made an expensive-looking build
 * read as a gradient demo: when everything glows, nothing is lit. The reference
 * films this design comes from do the opposite — a deep void, a single warm rim
 * light, and one subject in it at a time.
 *
 * So every hue in the 3D now comes from here, and it is all champagne gold, the
 * same accent the typography already uses. `fill` is the one exception and it is
 * deliberately close to neutral: a warm key with no fill at all crushes the
 * shadow side of glass into flat black. It is lighting practice, not a second
 * accent, and it must stay desaturated enough never to read as a colour.
 */
export const palette = {
  /** The rim light. Everything warm on the page is this or derived from it. */
  gold: "#c9a961",
  /** Champagne — highlights, the hot edge of a rim, emissive detail. */
  goldLight: "#e8d9a8",
  /** Bronze — the far side of a form, where the rim falls away. */
  bronze: "#8a6a2f",
  /** Near-black with a trace of warmth, so the void is not a dead grey. */
  void: "#07080c",
  /** Unsaturated bounce. Keeps shadow detail without introducing a hue. */
  fill: "#aab0c0",
  /** Bodies of the floating chips — dark, so the emissive edge does the work. */
  bodyWarm: "#231a10",
  bodyDeep: "#14100a",
} as const;

/** The accent, as the CSS custom property of the same name. */
export const ACCENT = palette.gold;
export const ACCENT_LIGHT = palette.goldLight;
