import { NextResponse, type NextRequest } from "next/server";

/**
 * Step two of the GitHub OAuth handshake.
 *
 * Exchanges the code for an access token and hands it back to the CMS window
 * that opened this popup, using the message format Decap and Sveltia both
 * expect. The token is never stored server-side and never written to a cookie —
 * it lives only in the CMS tab.
 */
export const dynamic = "force-dynamic";

/** The popup talks to its opener and then closes itself. */
function reply(payload: string, origin: string) {
  const body = `<!doctype html>
<meta charset="utf-8">
<title>Signing in…</title>
<body style="background:#04050d;color:#e9ebfa;font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0">
<p>Signing you in…</p>
<script>
  (function () {
    var message = ${JSON.stringify(payload)};
    var target = ${JSON.stringify(origin)};

    function send() {
      window.opener && window.opener.postMessage(message, target);
    }

    // Decap and Sveltia both wait for a handshake before accepting the token.
    window.addEventListener("message", function () { send(); }, { once: true });
    window.opener && window.opener.postMessage("authorizing:github", target);
    setTimeout(function () { send(); window.close(); }, 800);
  })();
</script>
</body>`;

  return new NextResponse(body, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = request.cookies.get("admin_oauth_state")?.value;

  const fail = (reason: string) =>
    reply(`authorization:github:error:${JSON.stringify({ message: reason })}`, origin);

  if (!code) return fail("GitHub did not return a code.");
  if (!state || !expected || state !== expected) {
    return fail("Sign-in state did not match. Close this window and try again.");
  }

  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return fail("Admin sign-in is not configured on the server.");
  }

  try {
    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${origin}/api/admin/callback`,
      }),
    });

    const data = (await res.json()) as { access_token?: string; error_description?: string };

    if (!data.access_token) {
      return fail(data.error_description || "GitHub did not issue a token.");
    }

    const response = reply(
      `authorization:github:success:${JSON.stringify({
        token: data.access_token,
        provider: "github",
      })}`,
      origin
    );
    response.cookies.delete("admin_oauth_state");
    return response;
  } catch {
    return fail("Could not reach GitHub to complete sign-in.");
  }
}
