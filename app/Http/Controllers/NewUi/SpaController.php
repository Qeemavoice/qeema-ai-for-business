<?php

namespace App\Http\Controllers\NewUi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * Serves the built React site (public/new-ui/index.html) for the new UI routes, with the page's
 * SEO tags written into the HTML on the server (title, description, canonical, Open Graph) so crawlers
 * see them before JavaScript runs. The values come from public/new-ui/seo.json, exported from
 * new-ui/src/seo/seoConfig.ts at build time: the client-side useSeo() then sets the same values.
 */
class SpaController extends Controller
{
    private static $seo = null;

    public function __invoke(Request $request)
    {
        $file = public_path('new-ui/index.html');
        if (!is_file($file)) {
            return response('New UI is not built yet. Run: cd new-ui && npm install && npm run build:laravel', 503)
                ->header('Content-Type', 'text/plain; charset=utf-8');
        }
        $html = file_get_contents($file);
        $path = '/' . trim($request->path(), '/');
        $status = 200;
        // A voice page has one address, /ar/booking/{id}-{clip}: another spelling of a live voice moves there (301),
        // a voice that is gone (deleted, hidden, never existed) answers 410 so Google drops it from the index
        if (preg_match('#^/ar/booking/(\d+)#', $path, $m)) {
            $want = self::voicePath($m[1]);
            if ($want === null) {
                $status = 410;
                $html = str_replace('</head>', "<meta name=\"robots\" content=\"noindex\" />\n</head>", $html);
            } elseif (rawurldecode($path) !== $want) {
                $q = $request->getQueryString();
                return redirect(self::encodePath($want) . ($q ? '?' . $q : ''), 301);
            }
        }
        $html = $this->injectSeo($html, $path);
        $html = $this->injectConfig($html);
        return response($html, $status)
            ->header('Content-Type', 'text/html; charset=utf-8')
            ->header('Cache-Control', 'no-cache');
    }

    public static function seoMap(): array
    {
        if (self::$seo === null) {
            $f = public_path('new-ui/seo.json');
            self::$seo = is_file($f) ? (json_decode(file_get_contents($f), true) ?: []) : [];
        }
        return self::$seo;
    }

    /**
     * Pages made from the database (voice booking pages, blog articles, success stories): the same title and
     * description the React page sets (BookingVoicePage, BlogDetailsPage, OurWorksPage), written here for crawlers.
     */
    private static function dynamicSeo(string $path): ?array
    {
        $brand = fn (string $t) => mb_substr($t, -9) === 'قيمة فويس' ? $t : "{$t} | قيمة فويس";
        $cut = fn (string $t) => mb_strlen($t) > 155 ? mb_substr($t, 0, 152) . '...' : $t;
        try {
            if (preg_match('#^/ar/booking/(\d+)#', $path, $m) && ($v = \App\Services\NewUi\Library::publicItem($m[1]))) {
                $dialect = $v['dialect'] ?: 'عربية';
                $title = trim((string) $v['metaTitle']) !== '' ? $brand(trim($v['metaTitle'])) : "{$v['name']} - عينة تعليق صوتي {$dialect} | قيمة فويس";
                $desc = trim((string) $v['metaDescription']) ?: ($v['description'] ? $cut($v['description'])
                    : "استمع إلى عينة «{$v['name']}» بلهجة {$dialect}، تخصص " . ($v['category'] ?: 'تعليق احترافي') . '. احجز الصوت مباشرة بجودة 48kHz.');
                $audio = (string) $v['previewUrl'];
                if ($audio !== '' && !preg_match('#^https?://#', $audio)) $audio = rtrim(self::seoMap()['site'] ?? 'https://qeemavoice.com', '/') . '/' . ltrim($audio, '/');
                return ['title' => $title, 'description' => $desc, 'canonicalPath' => self::voicePath($m[1]),
                    // AudioObject for Google (clip name only, like the page); no transcript: the library keeps no script text
                    'jsonLd' => array_filter(['@context' => 'https://schema.org', '@type' => 'AudioObject', 'name' => $v['name'], 'description' => $desc,
                        'contentUrl' => $audio ?: null, 'encodingFormat' => 'audio/mpeg', 'inLanguage' => 'ar',
                        'publisher' => ['@type' => 'Organization', 'name' => 'قيمة فويس', 'url' => 'https://qeemavoice.com']])];
            }
            if (preg_match('#^/ar/blogs/details/(\d+)#', $path, $m) && ($a = \App\Models\Article::find((int) $m[1]))) {
                $i = PublicController::articleItem($a);
                if ($i['status'] !== 'published' || $i['title'] === '') return null;
                return ['title' => $brand($i['title']), 'description' => trim($i['metaDescription']) ?: $cut(trim(strip_tags($i['shortDescription']))),
                    'keywords' => $i['keywords'], 'ogImage' => $i['coverImage'] ?: null];
            }
            if (preg_match('#^/ar/our-works/([^/]+)$#', $path, $m)) {
                foreach (\App\Services\NewUi\Store::list('stories') as $st) {
                    if ((string) ($st['id'] ?? '') === rawurldecode($m[1]) && ($st['status'] ?? '') === 'published') {
                        return ['title' => ($st['brand'] ?? $st['title'] ?? 'قصة نجاح') . ' | قصص النجاح | قيمة فويس',
                            'description' => trim((string) ($st['heroSubtitle'] ?? '')) ?: 'تجارب وقصص نجاح كبرى الشركات والجهات الحكومية العربية في التعليق الصوتي والرد الآلي والدوبلاج مع قيمة فويس.'];
                    }
                }
            }
        } catch (\Throwable $e) {
            report($e);
        }
        return null;
    }

    /** The one address of a public library voice (as the sitemap lists it), or null when it is not public */
    private static function voicePath(string $id): ?string
    {
        if (!\App\Services\NewUi\Library::publicItem($id)) return null;
        $v = \App\Models\Voice::with('voiceOver')->find((int) $id);
        return $v ? '/ar/booking/' . PublicController::voiceSlug($v) : null;
    }

    private static function encodePath(string $path): string
    {
        return implode('/', array_map('rawurlencode', array_map('rawurldecode', explode('/', $path))));
    }

    private function injectSeo(string $html, string $path): string
    {
        $routes = self::seoMap()['routes'] ?? [];
        // a story edited in the dashboard wins over the built-in copy exported in seo.json
        $cfg = (str_starts_with($path, '/ar/our-works/') ? self::dynamicSeo($path) : null) ?? $routes[$path] ?? self::dynamicSeo($path);
        if (!$cfg) return $html;
        $e = fn ($s) => htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');
        $site = rtrim(self::seoMap()['site'] ?? 'https://qeemavoice.com', '/');
        $canonical = $site . self::encodePath($cfg['canonicalPath'] ?? $path);
        $title = $e($cfg['title'] ?? '');
        $desc = $e($cfg['description'] ?? '');
        $image = $e($cfg['ogImage'] ?? (self::seoMap()['defaultOgImage'] ?? ''));

        if ($title) $html = preg_replace('#<title>.*?</title>#su', "<title>{$title}</title>", $html, 1);
        if ($desc) $html = preg_replace('#<meta name="description" content="[^"]*"\s*/?>#u', "<meta name=\"description\" content=\"{$desc}\" />", $html, 1);
        $html = preg_replace('#<meta property="og:title" content="[^"]*"\s*/?>#u', "<meta property=\"og:title\" content=\"{$title}\" />", $html, 1);
        $html = preg_replace('#<meta property="og:description" content="[^"]*"\s*/?>#u', "<meta property=\"og:description\" content=\"{$desc}\" />", $html, 1);
        $extra = "<link rel=\"canonical\" href=\"{$e($canonical)}\" />\n"
            . "<meta property=\"og:url\" content=\"{$e($canonical)}\" />\n"
            . ($image ? "<meta property=\"og:image\" content=\"{$image}\" />\n" : '')
            . (!empty($cfg['noindex']) ? "<meta name=\"robots\" content=\"noindex, nofollow\" />\n" : '')
            . (!empty($cfg['keywords']) ? "<meta name=\"keywords\" content=\"{$e($cfg['keywords'])}\" />\n" : '')
            . (!empty($cfg['jsonLd']) ? '<script type="application/ld+json" id="qeema-audio-jsonld">'
                . json_encode($cfg['jsonLd'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP) . "</script>\n" : '');
        return str_replace('</head>', $extra . '</head>', $html);
    }

    /** Runtime config for the front end (Google client id reuses the old site's Socialite credentials). */
    private function injectConfig(string $html): string
    {
        $cfg = [
            'googleClientId' => \App\Services\NewUi\Store::googleClientId(),
            'apiBase' => '',
        ];
        // only the admin page itself is told its private address (every other page's source stays without it)
        $admin = config('services.newui_admin_path');
        $path = trim(request()->path(), '/');
        if ($path === $admin || $path === 'ar/dashboard') $cfg['adminPath'] = '/' . $path;
        $json = json_encode($cfg, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);
        $robots = isset($cfg['adminPath']) ? "\n<meta name=\"robots\" content=\"noindex, nofollow\" />" : '';
        return str_replace('<head>', "<head>\n<script>window.__QV_CONFIG=" . $json . ";</script>" . $robots, $html);
    }
}
