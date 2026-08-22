/**
 * The scene palette — deep navy, and metal.
 *
 * There is deliberately no hue in the accent range. Chrome is not a colour; it
 * is the distance between a specular highlight and a slate shadow, and the
 * moment a metallic surface carries a tint it stops reading as metal and starts
 * reading as painted plastic. So every value below moves in brightness and
 * stays cool-neutral.
 *
 * The navy matters for the same reason. A pure black void gives a reflective
 * surface nothing to reflect, and metal rendered against nothing reads flat —
 * the ground has to be dark enough to be a void and blue enough to be a room.
 */
export const palette = {
  /** Chrome — the body of any metallic surface. */
  chrome: "#b9c6d6",
  /** Polished silver — the lit face, and the rim. */
  silver: "#e8eef6",
  /** The specular hit. Used sparingly; it is the brightest thing on the page. */
  specular: "#f6f9fd",
  /** Slate — the shadow side of metal, never black. */
  slate: "#5d6d84",
  /** Charcoal — the body of an unlit object. */
  charcoal: "#151b28",
  /** Deep navy. The ground everything sits in and reflects. */
  navy: "#000022",
  /** A step up from the ground, for surfaces catching bounce. */
  navyLift: "#00072b",
  /** Unsaturated bounce, so shadows keep detail without gaining a colour. */
  fill: "#8f9db2",

  /**
   * Signal. The one saturated colour on the site, and it is not a surface —
   * nothing metallic ever takes it.
   *
   * It exists for data in motion: the particles around the agent core, and
   * anything else that represents information rather than an object. Kept apart
   * from the metal on purpose, since a tinted metallic surface stops reading as
   * metal, and kept in one place so it cannot spread by accident.
   */
  signal: "#38bdf8",
} as const;

export const ACCENT = palette.chrome;
export const ACCENT_LIGHT = palette.silver;
