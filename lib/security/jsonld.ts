/**
 * Serialises structured data for a `<script type="application/ld+json">`.
 *
 * `JSON.stringify` alone is not safe inside a script element, and the reason is
 * easy to miss. An HTML parser looks for the literal characters `</script` and
 * ends the element there — it does not know or care that they are inside a JSON
 * string. So a single field containing that sequence closes the tag early and
 * everything after it is parsed as markup, which is a script-injection hole
 * opened by content rather than by code.
 *
 * Escaping `<` as `<` prevents it. JSON parsers read `<` as `<`, so
 * the structured data a search engine sees is unchanged; the HTML parser never
 * sees an angle bracket. `>` and `&` go the same way, which also covers the
 * `<!--` sequence that can put a parser into comment mode.
 *
 * None of the content on this site currently contains any of it. This is here
 * because "no field contains a script tag today" is not a property anybody can
 * keep true through a CMS, and the fix costs one function.
 */
export function ldJson(data: unknown) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
