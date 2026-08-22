#!/usr/bin/env bash
# Rebuild and serve the site on a fixed port, replacing whatever was there.
#
# Two things this exists to prevent, both of which have already cost time:
#   - `next start` failing silently because the previous run still holds the
#     port, so the browser then tests the OLD build and the new work looks
#     broken or absent;
#   - a running server whose .next was replaced underneath it, which answers
#     400 for every asset because the HTML references hashes it no longer has.
#
# Usage: scripts/preview.sh [port]
set -euo pipefail

PORT="${1:-3111}"
cd "$(dirname "$0")/.."

# Kill by port rather than by process name: matching on "next start" also
# matches the shell running this script.
if command -v fuser >/dev/null 2>&1; then
  fuser -k "${PORT}/tcp" 2>/dev/null || true
else
  pid=$(ss -lptn "sport = :${PORT}" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | head -1 || true)
  [ -n "${pid:-}" ] && kill "$pid" 2>/dev/null || true
fi
sleep 1

npm run build >/tmp/preview-build.log 2>&1 || {
  echo "BUILD FAILED"; tail -30 /tmp/preview-build.log; exit 1
}
grep -E "✓ Compiled|Compiled successfully" /tmp/preview-build.log | head -1

nohup npm run start -- -p "$PORT" >/tmp/preview-server.log 2>&1 &

for _ in $(seq 1 45); do
  if curl -fsS -o /dev/null "http://127.0.0.1:${PORT}/"; then
    echo "READY on ${PORT}"
    exit 0
  fi
  sleep 1
done

echo "SERVER DID NOT START"
tail -20 /tmp/preview-server.log
exit 1
