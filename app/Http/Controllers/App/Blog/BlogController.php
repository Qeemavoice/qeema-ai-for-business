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
        meta_data(trans_app('voiceover_blog'), null, [
            '#' => trans_app('blogs')
        ]);

        $articles = Article::where('status', ArticleStatus::PUBLISHED)
            ->latest()
            ->paginate(21);

        $banner = get_banner(Banner::$BLOG);

        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.index', compact('articles','banner'));
    }

    public function details($slug)
    {
        $article = Article::where('status', ArticleStatus::PUBLISHED)->findOrFail(get_id_by_slug($slug));

        meta_data($article->title, $article->title, [
            route_app('blog.index',['slug' => config('slugroute.slug_blogs')]) => trans_app('articles'),
            '#' => $article->title,],$article->short_description);

        $relatedArticles = Article::where('status', ArticleStatus::PUBLISHED)
            ->where('id', '!=', $article->id)
            ->limit(3)
            ->latest()
            ->get();

        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.details', compact('article', 'relatedArticles'));
    }
}
