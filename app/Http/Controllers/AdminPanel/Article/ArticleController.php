<?php


namespace App\Http\Controllers\AdminPanel\Article;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Article\StoreArticleRequest;
use App\Http\Resources\AdminPanel\Article\ArticlesResource;
use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends CoreController
{
    use ArticleTrait;

    public function __construct(Article $article)
    {
        $this->dirView = 'articles';
        $this->asRoute = 'article';
        $this->route = 'articles';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($article);
    }

    public function index()
    {
        $pageTitle = trans_admin('articles');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function create()
    {
        $pageTitle = trans_admin('add_article');

        meta_data(trans_admin('articles'), trans_admin('articles'), [
            $this->routeUrl => trans_admin('articles'),
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;
        $statuses = $this->getStatuses();

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create',
            compact('pageTitle', 'asRoute', 'statuses')
        );
    }

    public function data(Request $request)
    {
        $rows = new $this->model();

        $rows = $this->filter($request, $rows);

        $rows = $this->sort($request, $rows);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $rows = $rows->paginate($limit);

        $data = ArticlesResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function edit($id)
    {
        $article = $this->model::findOrFail($id);

        $pageTitle = trans_admin('edit_article');

        meta_data(trans_admin('articles'), trans_admin('articles'), [
            $this->routeUrl => trans_admin('articles'),
            '' => $pageTitle
        ]);

        $statuses = $this->getStatuses();

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'article', 'statuses'));
    }


    public function store(StoreArticleRequest $request)
    {
        $id = $request->id;

        if ($id) {
            $store = $this->model::findOrFail($id);
        } else {
            $store = new $this->model();
        }

        $store->title = $request->title;
        $store->content = $request->a_content;
        $store->meta_description = $request->meta_description;
        $store->meta_keywords = $request->meta_keywords;
        $store->short_description = $request->short_description;
        $store->video_url = $request->video_url;
        $store->external_image = $request->external_image;
        $store->internal_image = $request->internal_image;
        $store->status = $request->status;
        $store->save();

        return $this->successResponse($store);
    }

    public function destroy($id)
    {
        return $this->deleteResponse($this->model::findOrFail($id)->delete());
    }


}
