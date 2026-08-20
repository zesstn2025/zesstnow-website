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
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;

  if (!clientId) {
    return new NextResponse(
      "Admin sign-in is not configured: GITHUB_OAUTH_CLIENT_ID is missing. " +
        "Add it in the Vercel project settings and redeploy.",
      { status: 500, headers: { "content-type": "text/plain" } }
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
