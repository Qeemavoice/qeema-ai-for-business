<?php

namespace App\Http\Controllers\NewUi;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleStatus;
use App\Models\Voice;
use App\Models\VoiceStatus;
use App\Services\NewUi\Store;

/**
 * sitemap.xml and robots.txt of the new site (port of new-ui/server/routes/sitemap.ts).
 * Static pages, service/model/dialect landing pages and built-in blog posts come from seo.json (exported at build);
 * dashboard articles, success stories and library voices come from the database.
 */
class SitemapController extends Controller
{
    private const SITE = 'https://qeemavoice.com';

    private const STATIC_PAGES = [
        ['/ar', 1.0, 'daily'], ['/ar/voices', 0.9, 'daily'], ['/ar/voice-models', 0.9, 'weekly'],
        ['/ar/text-to-speech', 0.9, 'weekly'], ['/ar/pricing', 0.8, 'weekly'], ['/ar/our-works', 0.7, 'weekly'],
        ['/ar/blogs', 0.7, 'daily'], ['/ar/guides', 0.6, 'monthly'], ['/ar/guides/join-qeema-voice', 0.5, 'monthly'],
        ['/ar/categories', 0.6, 'monthly'], ['/ar/booking-steps', 0.6, 'monthly'], ['/ar/faqs', 0.6, 'monthly'],
        ['/ar/contact-us', 0.5, 'yearly'], ['/ar/p/about-us', 0.5, 'yearly'], ['/ar/p/revisions-policy', 0.3, 'yearly'],
        ['/ar/p/terms-of-use', 0.2, 'yearly'], ['/ar/p/privacy-policy', 0.2, 'yearly'],
    ];

    public function sitemap()
    {
        $urls = [];
        $add = function (string $path, float $priority, string $freq, ?string $lastmod = null) use (&$urls) {
            if (!isset($urls[$path])) $urls[$path] = [$priority, $freq, $lastmod];
        };
        foreach (self::STATIC_PAGES as [$p, $pr, $f]) $add($p, $pr, $f);

        $seo = SpaController::seoMap();
        foreach ($seo['serviceRoutes'] ?? [] as $route) $add($route, 0.8, 'monthly');
        foreach ($seo['blogPosts'] ?? [] as $post) $add('/ar/blogs/details/' . $post['slug'], 0.6, 'monthly', self::day($post['dateModified'] ?? null));

        // Blog articles of the dashboard (old `articles` table): same slug form the old site used (id-title)
        foreach (Article::where('status', ArticleStatus::PUBLISHED)->whereNotIn('id', array_keys(config('seo.duplicate_article_redirects', [])))->orderByDesc('id')->get() as $a) {
            $add('/ar/blogs/details/' . PublicController::articleSlug($a), 0.6, 'monthly', Store::day(Store::created($a)));
        }
        // Success stories (dashboard copy, built-in list as fallback)
        $stories = array_values(array_filter(Store::list('stories'), fn ($s) => ($s['status'] ?? '') === 'published'));
        foreach ($stories ?: ($seo['stories'] ?? []) as $s) $add('/ar/our-works/' . (is_array($s) ? $s['id'] : $s), 0.6, 'monthly');
        // Library voices (old `voices` table): /ar/booking/{id}-{title}, as the old sitemap listed them
        foreach (Voice::where('voice_status_id', VoiceStatus::ACCEPTED)->orderByDesc('id')->get() as $v) {
            $add('/ar/booking/' . PublicController::voiceSlug($v), 0.5, 'weekly', Store::day(Store::created($v)));
        }

        $today = date('Y-m-d');
        $body = '';
        foreach ($urls as $path => [$priority, $freq, $lastmod]) {
            $body .= "  <url>\n    <loc>" . self::loc($path) . "</loc>\n    <lastmod>" . ($lastmod ?: $today)
                . "</lastmod>\n    <changefreq>{$freq}</changefreq>\n    <priority>" . number_format($priority, 1) . "</priority>\n  </url>\n";
        }
        $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n{$body}</urlset>\n";
        return response($xml)->header('Content-Type', 'application/xml; charset=utf-8');
    }

    public function robots()
    {
        $txt = "User-agent: *\nAllow: /\nDisallow: /ar/admin\nDisallow: /ar/dashboard\nDisallow: /ar/account\nDisallow: /ar/talent-\n"
            . "Disallow: /ar/claim\nDisallow: /claim/\nDisallow: /ar/generate\nDisallow: /api/\nDisallow: /ar/clients\nDisallow: /ar/voice-actors\n\n"
            . 'Sitemap: ' . self::SITE . "/sitemap.xml\n";
        return response($txt)->header('Content-Type', 'text/plain; charset=utf-8');
    }

    /** Arabic slugs are percent-encoded so every URL is valid ASCII */
    private static function loc(string $path): string
    {
        $parts = array_map(fn ($p) => rawurlencode(rawurldecode($p)), explode('/', $path));
        return htmlspecialchars(self::SITE . implode('/', $parts), ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }

    private static function day($d): ?string
    {
        if (!$d) return null;
        $t = strtotime((string) $d);
        return $t ? date('Y-m-d', $t) : null;
    }
}
