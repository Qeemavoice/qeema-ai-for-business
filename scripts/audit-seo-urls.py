#!/usr/bin/env python3
"""Read-only audit of canonical sitemap URLs and redirect behavior."""
import collections
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

BASE = "https://qeemavoice.com"
MAX_URLS = 500
TIMEOUT = 12
HEADERS = {"User-Agent": "QeemaVoice-SEO-Audit/1.0"}

def fetch(url, method="GET"):
    req = urllib.request.Request(url, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as response:
            return response.status, response.url, response.read() if method == "GET" else b""
    except urllib.error.HTTPError as exc:
        return exc.code, exc.url, b""
    except Exception as exc:
        return 0, str(exc), b""

status, _, xml = fetch(BASE + "/sitemap.xml")
if status != 200:
    print("ERROR: sitemap unavailable:", status)
    sys.exit(1)

root = ET.fromstring(xml)
urls = [node.text.strip() for node in root.findall(".//{*}loc") if node.text]
print("Sitemap URLs:", len(urls))
if len(urls) > MAX_URLS:
    print("WARNING: auditing first", MAX_URLS, "URLs")

issues = []
counts = collections.Counter()
for url in urls[:MAX_URLS]:
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != "https" or parsed.netloc != "qeemavoice.com" or parsed.fragment:
        issues.append(("noncanonical-sitemap-url", url, ""))
        continue
    code, final, _ = fetch(url, "HEAD")
    counts[code] += 1
    if code == 405:
        code, final, _ = fetch(url, "GET")
        counts[code] += 1
    if code != 200 or urllib.parse.urldefrag(final)[0] != url:
        issues.append(("sitemap-response", url, f"{code} -> {final}"))

for path in ["/ar", "/sitemap.xml", "/robots.txt"]:
    code, final, _ = fetch(BASE + path, "GET")
    if code != 200:
        issues.append(("essential-url", BASE + path, f"{code} -> {final}"))

for url in ["https://www.qeemavoice.com/ar", "http://qeemavoice.com/ar"]:
    code, final, _ = fetch(url, "HEAD")
    if code != 200 or final != BASE + "/ar":
        issues.append(("redirect", url, f"{code} -> {final}"))

print("HTTP response counts:", dict(counts))
print("Issues:", len(issues))
for category, url, details in issues[:100]:
    print(f"[{category}] {url} {details}")
if len(issues) > 100:
    print("Additional issues:", len(issues) - 100)
# Report-only: historical broken URLs require manual destination mapping.
