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
        $html = $this->injectSeo($html, $path);
        $html = $this->injectConfig($html);
        return response($html)
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

    private function injectSeo(string $html, string $path): string
    {
        $routes = self::seoMap()['routes'] ?? [];
        $cfg = $routes[$path] ?? null;
        if (!$cfg) return $html;
        $e = fn ($s) => htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');
        $site = rtrim(self::seoMap()['site'] ?? 'https://qeemavoice.com', '/');
        $canonical = $site . implode('/', array_map('rawurlencode', array_map('rawurldecode', explode('/', $path))));
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
            . (!empty($cfg['keywords']) ? "<meta name=\"keywords\" content=\"{$e($cfg['keywords'])}\" />\n" : '');
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
        if (trim(request()->path(), '/') === $admin) $cfg['adminPath'] = '/' . $admin;
        $json = json_encode($cfg, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);
        $robots = isset($cfg['adminPath']) ? "\n<meta name=\"robots\" content=\"noindex, nofollow\" />" : '';
        return str_replace('<head>', "<head>\n<script>window.__QV_CONFIG=" . $json . ";</script>" . $robots, $html);
    }
}
