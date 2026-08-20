import { NextResponse, type NextRequest } from "next/server";

/**
 * Step one of the GitHub OAuth handshake for the admin CMS.
 *
 * The CMS opens this in a popup; we bounce the browser to GitHub's consent
 * screen and GitHub returns to /api/admin/callback with a code.
 *
 * `repo` scope is required rather than optional: publishing a post is a commit
 * to a private repository, and GitHub has no narrower scope that permits it.
 * Only accounts with write access to the repo can publish, so the repo's own
 * collaborator list is the access control.
 */
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    // "It is missing" is not a useful answer when someone has just set it —
    // the real causes are a variable scoped to the wrong environment, a
    // mistyped name, or a value that never saved. Report which of those it is,
    // by name and length only. Values are never echoed.
    const seen = Object.keys(process.env)
      .filter((k) => k.startsWith("GITHUB_"))
      .sort()
      .map((k) => `  ${k} = ${(process.env[k] ?? "").trim().length} characters`);

    return new NextResponse(
      [
        "Admin sign-in is not configured.",
        "",
        `  GITHUB_OAUTH_CLIENT_ID     ${clientId ? "found" : "MISSING or empty"}`,
        `  GITHUB_OAUTH_CLIENT_SECRET ${clientSecret ? "found" : "MISSING or empty"}`,
        "",
        "GITHUB_* variables this deployment can actually see:",
        seen.length ? seen.join("\n") : "  (none)",
        "",
        "If the list above is empty, the variables were not attached to the",
        "Production environment, or the deployment predates them. In Vercel:",
        "Settings > Environment Variables — tick Production, save, then",
        "Deployments > latest > ... > Redeploy.",
        "",
        `Deployment region ${process.env.VERCEL_REGION ?? "unknown"}, env ${process.env.VERCEL_ENV ?? "unknown"}.`,
      ].join("\n"),
      { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } }
    );
  }

  const origin = new URL(request.url).origin;
  const state = crypto.randomUUID();

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", `${origin}/api/admin/callback`);
  authorize.searchParams.set("scope", "repo,user");
  authorize.searchParams.set("state", state);

  const response = NextResponse.redirect(authorize.toString());

  // Round-tripped through GitHub and compared in the callback, so a code from
  // somewhere else cannot be replayed into this session.
  response.cookies.set("admin_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
