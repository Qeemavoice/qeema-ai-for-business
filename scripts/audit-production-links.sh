#!/usr/bin/env bash
# Public, read-only SEO health check for production.
set -euo pipefail

BASE_URL="https://qeemavoice.com"
SITEMAP_URL="$BASE_URL/sitemap.xml"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

curl_opts=(--connect-timeout 5 --max-time 15 -sSI -L --max-redirs 5)

echo "=== SITEMAP URL STATUS ==="
curl --connect-timeout 5 --max-time 20 -fsS "$SITEMAP_URL" > "$TMP_DIR/sitemap.xml"

grep -oE '<loc>[^<]+' "$TMP_DIR/sitemap.xml"   | sed 's#<loc>##'   | sort -u > "$TMP_DIR/sitemap-urls.txt"

xargs -d '\n' -P 20 -I{} bash -c '
  url="$1"
  result="$(curl --connect-timeout 5 --max-time 15 -sSI -o /dev/null -w "%{http_code} %{num_redirects} %{url_effective}" -L --max-redirs 5 "$url" || true)"
  set -- $result
  code="${1:-000}"
  redirects="${2:-0}"

  if [[ "$code" != "200" ]]; then
    echo "BAD sitemap: $result <- $url"
  elif [[ "$redirects" != "0" ]]; then
    echo "REDIRECT sitemap: $result <- $url"
  fi
' _ {} < "$TMP_DIR/sitemap-urls.txt" > "$TMP_DIR/sitemap-results.txt"

cat "$TMP_DIR/sitemap-results.txt"
sitemap_total="$(wc -l < "$TMP_DIR/sitemap-urls.txt" | tr -d ' ')"
sitemap_bad="$(grep -c '^BAD sitemap:' "$TMP_DIR/sitemap-results.txt" || true)"
sitemap_redirects="$(grep -c '^REDIRECT sitemap:' "$TMP_DIR/sitemap-results.txt" || true)"
echo "SITEMAP SUMMARY total=$sitemap_total bad=$sitemap_bad redirects=$sitemap_redirects"

echo "=== INTERNAL LINK STATUS ==="
cat > "$TMP_DIR/seed-urls.txt" <<'EOF'
https://qeemavoice.com/ar
https://qeemavoice.com/ar/categories/التصنيفات
https://qeemavoice.com/ar/voices/أطلب-أفضل-معلقيين-صوتين-محترفين-عربيا-من-قيمة
https://qeemavoice.com/ar/blogs/مدونة-التعليق-الصوتي-من-قيمة-فويس
https://qeemavoice.com/ar/guides
https://qeemavoice.com/ar/faqs/الأسئلة-الشائعة
EOF

: > "$TMP_DIR/internal-urls.raw"
: > "$TMP_DIR/media-urls.raw"

while IFS= read -r page; do
  html="$(curl --connect-timeout 5 --max-time 15 -fsSL "$page" || true)"
  [[ -n "$html" ]] || continue

  grep -oE 'href="[^"]+"' <<<"$html"     | sed -E 's/^href="|"$//g'     | sed 's/&amp;/\&/g'     | grep -E '^https://qeemavoice\.com/|^/'     | while IFS= read -r href; do
        if [[ "$href" == /* ]]; then
          printf '%s%s\n' "$BASE_URL" "$href"
        else
          printf '%s\n' "$href"
        fi
      done >> "$TMP_DIR/internal-urls.raw" || true

  grep -oE '(src|data-src)="[^"]+"' <<<"$html"     | sed -E 's/^(src|data-src)="|"$//g'     | grep -E '^https://qeemavoice\.com/|^/'     | while IFS= read -r src; do
        if [[ "$src" == /* ]]; then
          printf '%s%s\n' "$BASE_URL" "$src"
        else
          printf '%s\n' "$src"
        fi
      done >> "$TMP_DIR/media-urls.raw" || true
done < "$TMP_DIR/seed-urls.txt"

sed 's/#.*$//' "$TMP_DIR/internal-urls.raw"   | grep -vE '/logout($|\?)|/do/|/auth/google|/cdn-cgi/'   | grep -v '^$'   | sort -u > "$TMP_DIR/internal-urls.txt" || true

grep -vE '/cdn-cgi/' "$TMP_DIR/media-urls.raw"   | grep -v '^$'   | sort -u > "$TMP_DIR/media-urls.txt" || true

xargs -d '\n' -P 20 -I{} bash -c '
  url="$1"
  result="$(curl --connect-timeout 5 --max-time 15 -sSI -o /dev/null -w "%{http_code} %{num_redirects} %{url_effective}" -L --max-redirs 5 "$url" || true)"
  set -- $result
  code="${1:-000}"
  redirects="${2:-0}"

  if [[ "$code" == "404" || "$code" =~ ^5 || "$code" == "000" ]]; then
    echo "BAD link: $result <- $url"
  elif [[ "$redirects" -gt 1 ]]; then
    echo "CHAIN link: $result <- $url"
  fi
' _ {} < "$TMP_DIR/internal-urls.txt" > "$TMP_DIR/link-results.txt"

cat "$TMP_DIR/link-results.txt"
link_total="$(wc -l < "$TMP_DIR/internal-urls.txt" | tr -d ' ')"
link_bad="$(grep -c '^BAD link:' "$TMP_DIR/link-results.txt" || true)"
link_chains="$(grep -c '^CHAIN link:' "$TMP_DIR/link-results.txt" || true)"
echo "LINK SUMMARY total=$link_total bad=$link_bad chains=$link_chains"

echo "=== MEDIA STATUS ==="
xargs -d '\n' -P 20 -I{} bash -c '
  url="$1"
  result="$(curl --connect-timeout 5 --max-time 15 -sSI -o /dev/null -w "%{http_code} %{content_type}" -L --max-redirs 3 "$url" || true)"
  set -- $result
  code="${1:-000}"
  content_type="${2:-}"

  if [[ "$code" != "200" ]]; then
    echo "BAD media: $result <- $url"
  elif [[ "$content_type" == text/html* ]]; then
    echo "HTML media: $result <- $url"
  fi
' _ {} < "$TMP_DIR/media-urls.txt" > "$TMP_DIR/media-results.txt"

cat "$TMP_DIR/media-results.txt"
media_total="$(wc -l < "$TMP_DIR/media-urls.txt" | tr -d ' ')"
media_bad="$(grep -Ec '^(BAD|HTML) media:' "$TMP_DIR/media-results.txt" || true)"
echo "MEDIA SUMMARY total=$media_total bad=$media_bad"

echo "=== REDIRECT CANONICALS ==="
for url in   "https://www.qeemavoice.com/ar"   "http://qeemavoice.com/ar"   "https://qeemavoice.com/" ; do
  result="$(curl --connect-timeout 5 --max-time 15 -sSI -o /dev/null -w '%{http_code} %{num_redirects} %{url_effective}' -L --max-redirs 5 "$url" || true)"
  echo "$url -> $result"
done

echo "AUDIT SUMMARY sitemap_bad=$sitemap_bad sitemap_redirects=$sitemap_redirects link_bad=$link_bad media_bad=$media_bad chains=$link_chains"

if (( sitemap_bad > 0 || link_bad > 0 || media_bad > 0 || link_chains > 0 )); then
  exit 1
fi
