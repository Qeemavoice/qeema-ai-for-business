<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Voice;

class SitemapXmlController extends Controller
{
    public function index()
    {
        $baseUrl = url('/') . '/ar';
        $baseUrlWithWww = preg_replace('#^https?://#', '$0www.', $baseUrl);

        $posts = Article::orderBy('id', 'desc')->get();
        $voices = Voice::select('id', 'title', 'created_at')->orderBy('id', 'desc')->get();

        header('Content-Type: application/xml; charset=utf-8');
        header("Content-type: text/xml");
        echo '<?xml version="1.0" standalone="yes"?>';
        echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
            <url>
                <loc>' . $baseUrlWithWww . '</loc>
                <priority>1.0</priority>
                <changefreq>daily</changefreq>
            </url>
            <url>
                <loc>' . $baseUrl . '/#divbooking</loc>
                <lastmod>2022-03-01T12:49:59+00:00</lastmod>
                <priority>0.8</priority>
                <changefreq>daily</changefreq>
            </url>
            <url>
                <loc>' . $baseUrl . '/voices</loc>
                <lastmod>2022-03-01T12:49:59+00:00</lastmod>
                <priority>0.8</priority>
                <changefreq>daily</changefreq>
            </url>
            <url>
                <loc>' . $baseUrl . '/#divcategores</loc>
                <lastmod>2022-03-01T12:49:59+00:00</lastmod>
                <priority>0.8</priority>
                <changefreq>daily</changefreq>
            </url>
            <url>
                <loc>' . $baseUrl . '/#navworks</loc>
                <lastmod>2022-03-01T12:49:59+00:00</lastmod>
                <priority>0.8</priority>
                <changefreq>daily</changefreq>
            </url>
            <url>
                <loc>' . $baseUrl . '/#navourclients</loc>
                <lastmod>2022-03-01T12:49:59+00:00</lastmod>
                <priority>0.8</priority>
                <changefreq>daily</changefreq>
            </url>
            <url>
                <loc>' . $baseUrl . '/blogs</loc>
                <lastmod>2022-03-01T12:49:59+00:00</lastmod>
                <priority>0.8</priority>
                <changefreq>daily</changefreq>
            </url>
            <url>
                <loc>' . $baseUrl . '/contact-us</loc>
                <lastmod>2022-03-01T12:49:59+00:00</lastmod>
                <priority>0.8</priority>
                <changefreq>daily</changefreq>
            </url>';

        foreach ($posts as $post) {

            echo '<url>
                        <loc>' . $baseUrl . '/blogs/details/' . $post->slug . '</loc>
                        <lastmod>' . date("c", strtotime($post->created_at)) . '</lastmod>
                        <priority>0.8</priority>
                        <changefreq>daily</changefreq>
                    </url>';
        }

        foreach ($voices as $voice) {

            echo '<url>
                            <loc>' . $baseUrl . '/booking/' . $voice->slug . '</loc>
                            <lastmod>' . date("c", strtotime($voice->created_at)) . '</lastmod>
                            <priority>0.8</priority>
                            <changefreq>daily</changefreq>
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
