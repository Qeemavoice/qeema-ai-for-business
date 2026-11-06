<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleStatus;
use App\Models\Guide;
use App\Models\Page;
use App\Models\Voice;
use App\Models\VoiceStatus;

class SitemapXmlController extends Controller
{
    public function index()
    {
        $baseUrl = 'https://qeemavoice.com';
        $baseUrlWithLang = $baseUrl . '/ar';

        $duplicateArticleIds = array_keys(config('seo.duplicate_article_redirects', []));

        $posts = Article::where('status', ArticleStatus::PUBLISHED)
            ->when(
                !empty($duplicateArticleIds),
                fn ($query) => $query->whereNotIn('id', $duplicateArticleIds)
            )
            ->orderBy('id', 'desc')
            ->get();
        $voices = Voice::select('id', 'title', 'audio_file', 'voice_status_id', 'language_id', 'dialect_id', 'created_at')
            ->where('voice_status_id', VoiceStatus::ACCEPTED)
            ->whereNotNull('audio_file')
            ->whereHas('language')
            ->whereHas('dialect')
            ->whereHas('categories.category')
            ->orderBy('id', 'desc')
            ->get();
        $guides = Guide::select('id', 'name', 'created_at')->orderBy('id', 'desc')->get();
        $pages = Page::select('slug', 'updated_at', 'created_at')->orderBy('id')->get();

        header('Content-Type: application/xml; charset=utf-8');

        echo '<?xml version="1.0" encoding="UTF-8"?>';
        echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        echo '<url>
            <loc>' . $baseUrlWithLang . '</loc>
            <priority>1.0</priority>
            <changefreq>daily</changefreq>
        </url>';

        $staticPages = [
            '/categories/' . config('slugroute.slug_categories'),
            '/voices/' . config('slugroute.slug_voices'),
            '/booking-steps/' . config('slugroute.slug_booking_steps'),
            '/our-works/' . config('slugroute.slug_our_works'),
            '/jobs',
            '/faqs/' . config('slugroute.slug_faq'),
            '/guides',
            '/blogs/' . config('slugroute.slug_blogs'),
            '/contact-us/' . config('slugroute.slug_contact_us'),
        ];

        foreach ($staticPages as $path) {
            echo '<url>
                <loc>' . $baseUrlWithLang . $path . '</loc>
                <priority>0.8</priority>
                <changefreq>weekly</changefreq>
            </url>';
        }


        foreach ($pages as $page) {
            $lastmod = $page->updated_at ?: $page->created_at;

            echo '<url>
                <loc>' . htmlspecialchars(
                    $baseUrlWithLang . '/p/' . $page->slug,
                    ENT_XML1,
                    'UTF-8'
                ) . '</loc>
                <lastmod>' . date('c', strtotime($lastmod)) . '</lastmod>
                <priority>0.7</priority>
                <changefreq>monthly</changefreq>
            </url>';
        }

        foreach ($posts as $post) {
            echo '<url>
                <loc>' . htmlspecialchars(
                    $baseUrlWithLang . '/blogs/details/' . $post->slug,
                    ENT_XML1,
                    'UTF-8'
                ) . '</loc>
                <lastmod>' . date('c', strtotime($post->created_at)) . '</lastmod>
                <priority>0.8</priority>
                <changefreq>weekly</changefreq>
            </url>';
        }

        foreach ($voices as $voice) {
            echo '<url>
                <loc>' . htmlspecialchars(
                    $baseUrlWithLang . '/booking/' . $voice->slug,
                    ENT_XML1,
                    'UTF-8'
                ) . '</loc>
                <lastmod>' . date('c', strtotime($voice->created_at)) . '</lastmod>
                <priority>0.8</priority>
                <changefreq>weekly</changefreq>
            </url>';
        }

        foreach ($guides as $guide) {
            echo '<url>
                <loc>' . htmlspecialchars(
                    $baseUrlWithLang . '/guides/' . $guide->slug,
                    ENT_XML1,
                    'UTF-8'
                ) . '</loc>
                <lastmod>' . date('c', strtotime($guide->created_at)) . '</lastmod>
                <priority>0.8</priority>
                <changefreq>weekly</changefreq>
            </url>';
        }

        echo '</urlset>';
        exit;
    }

    public function show()
    {
        return response()->view('genratedsitemap')->header('Content-Type', 'text/xml');
    }
}
