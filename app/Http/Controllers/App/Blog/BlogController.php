<?php


namespace App\Http\Controllers\App\Blog;


use App\Http\Controllers\App\CoreController;
use App\Models\Article;
use App\Models\ArticleStatus;
use App\Models\Banner;

class BlogController extends CoreController
{
    protected $dirView;

    public function __construct()
    {
        $this->dirView = 'blog';
    }

    public function index()
    {
        $routeSlug = request()->route('slug');
        $canonicalSlug = config('slugroute.slug_blogs');

        if ($routeSlug !== $canonicalSlug) {
            $target = route_app('blog.index', ['slug' => $canonicalSlug]);
            if (request()->getQueryString()) {
                $target .= '?' . request()->getQueryString();
            }
            return redirect()->to($target, 301);
        }

        $metaDescription = trans_seo('blogs.meta_description');
        $metaKeywords = trans_seo('blogs.meta_keywords');

        meta_data(trans_app('voiceover_blog'), null, [
            '#' => trans_app('blogs')
        ]);

        meta('canonical', route_app('blog.index', ['slug' => config('slugroute.slug_blogs')]));

        $articles = Article::where('status', ArticleStatus::PUBLISHED)
            ->latest()
            ->paginate(21);

        $banner = get_banner(Banner::$BLOG);

        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.index',
            compact('articles','banner','metaDescription','metaKeywords')
        );
    }

    public function details($slug)
    {
        $article = Article::where('status', ArticleStatus::PUBLISHED)->findOrFail(get_id_by_slug($slug));

        $duplicateRedirects = config('seo.duplicate_article_redirects', []);
        if (isset($duplicateRedirects[$article->id])) {
            $canonicalArticle = Article::where('status', ArticleStatus::PUBLISHED)
                ->findOrFail($duplicateRedirects[$article->id]);

            return redirect()->to(
                route_app('blog.details', ['slug' => $canonicalArticle->slug]),
                301
            );
        }

        if ($slug !== $article->slug) {
            return redirect()->to(route_app('blog.details', ['slug' => $article->slug]), 301);
        }

        meta_data($article->title, $article->title, [
            route_app('blog.index',['slug' => config('slugroute.slug_blogs')]) => trans_app('articles'),
            '#' => $article->title,
        ], $article->meta_description ?: $article->short_description);

        meta('canonical', route_app('blog.details', ['slug' => $article->slug]));

        $relatedArticles = Article::where('status', ArticleStatus::PUBLISHED)
            ->where('id', '!=', $article->id)
            ->limit(3)
            ->latest()
            ->get();

        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.details', compact('article', 'relatedArticles'));
    }
}
