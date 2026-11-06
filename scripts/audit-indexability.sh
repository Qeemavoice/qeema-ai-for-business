#!/usr/bin/env bash
set -euo pipefail

BASE_URL="https://qeemavoice.com"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

curl --connect-timeout 5 --max-time 20 -fsS "$BASE_URL/sitemap.xml" > "$TMP_DIR/sitemap.xml"
grep -oE '<loc>[^<]+' "$TMP_DIR/sitemap.xml" | sed 's#<loc>##' | sort -u > "$TMP_DIR/urls.txt"

xargs -d '\n' -P 12 -I{} bash -c '
  url="$1"
  body_file="$(mktemp)"
  headers_file="$(mktemp)"
  trap "rm -f \"$body_file\" \"$headers_file\"" EXIT

  code="$(curl --connect-timeout 5 --max-time 20 -sS -L --max-redirs 3 -D "$headers_file" -o "$body_file" -w "%{http_code}" "$url" || true)"

  if [[ "$code" != "200" ]]; then
    echo "BAD_STATUS $code $url"
    exit 0
  fi

  canonical="$(grep -oEi "<link[^>]+rel=[\"'\'' ]*canonical[\"'\'' ]*[^>]*>" "$body_file" | head -1 | grep -oE "href=[\"'\''][^\"'\'']+" | sed -E "s/^href=[\"'\'']//" || true)"
  robots="$(grep -oEi "<meta[^>]+name=[\"'\'']robots[\"'\''][^>]*>" "$body_file" | head -1 | grep -oEi "content=[\"'\''][^\"'\'']+" | sed -E "s/^content=[\"'\'']//I" || true)"
  title="$(grep -oEi "<title>[^<]*</title>" "$body_file" | head -1 | sed -E "s#</?title>##Ig" | xargs || true)"
  description="$(grep -oEi "<meta[^>]+name=[\"'\'']description[\"'\''][^>]*>" "$body_file" | head -1 | grep -oEi "content=[\"'\''][^\"'\'']*" | sed -E "s/^content=[\"'\'']//I" || true)"

  if [[ -z "$canonical" ]]; then
    echo "NO_CANONICAL $url"
  else
    normalized_url="$(python3 -c "import sys,urllib.parse; print(urllib.parse.unquote(sys.argv[1]))" "$url")"
    normalized_canonical="$(python3 -c "import sys,urllib.parse; print(urllib.parse.unquote(sys.argv[1]))" "$canonical")"
    if [[ "$normalized_canonical" != "$normalized_url" ]]; then
      echo "CANONICAL_MISMATCH $url -> $canonical"
    fi
  fi

  if [[ -z "$robots" ]]; then
    echo "NO_ROBOTS $url"
  elif [[ "$robots" == *noindex* ]]; then
    echo "NOINDEX_IN_SITEMAP $url -> $robots"
  fi

  if [[ -z "$title" ]]; then
    echo "NO_TITLE $url"
  fi

  if [[ -z "$description" ]]; then
    echo "NO_DESCRIPTION $url"
  fi
' _ {} < "$TMP_DIR/urls.txt" > "$TMP_DIR/results.txt"

cat "$TMP_DIR/results.txt"

total="$(wc -l < "$TMP_DIR/urls.txt" | tr -d ' ')"
issues="$(wc -l < "$TMP_DIR/results.txt" | tr -d ' ')"
echo "INDEXABILITY SUMMARY total=$total issues=$issues"

if (( issues > 0 )); then
  exit 1
fi
