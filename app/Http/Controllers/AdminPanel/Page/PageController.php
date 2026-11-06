<?php


namespace App\Http\Controllers\AdminPanel\Page;

use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Page\StorePagesRequest;
use App\Http\Resources\AdminPanel\Page\PageResource;
use App\Models\Page;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class PageController extends CoreController
{
    public function __construct(Page $page)
    {
        $this->dirView = 'pages';
        $this->asRoute = 'page';
        $this->route = 'pages';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($page);
    }

    public function index($page_slug)
    {
        $page = $this->model->whereSlug($page_slug)->orderBy('id', 'desc')->first();

        if (!$page) {
            abort(404);
        }

        $pageTitle = $page->title;

        meta_data($pageTitle, $pageTitle, [
            '#' => trans_admin('pages'),
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;
        //  $page = new PageResource($page);
        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index',
            compact('pageTitle', 'asRoute', 'page')
        );
    }

    public function store(StorePagesRequest $request)
    {
        $page = $this->model->findOrFail($request->id);

        $slug = Str::slug($request->title['en']);

        $page = $page->update([
            'title' => $request->title,
            'slug' => $slug,
            'content' => $request->description,
        ]);
        Cache::forget('pages');
        return $this->response($page);
    }

    public function all()
    {
        return $this->response(PageResource::collection(($this->model::pages())->where('slug', Page::TRAINING)));
    }
}
