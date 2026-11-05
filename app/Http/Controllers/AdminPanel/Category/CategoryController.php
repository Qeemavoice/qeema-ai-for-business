<?php


namespace App\Http\Controllers\AdminPanel\Category;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Category\StoreCategoryRequest;
use App\Http\Resources\AdminPanel\Category\CategoriesResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends CoreController
{
    use CategoryTrait;

    public function __construct(Category $category)
    {
        $this->dirView = 'categories';
        $this->asRoute = 'category';
        $this->route = 'categories';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($category);
    }

    public function index()
    {
        $pageTitle = trans_admin('categories');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function create()
    {
        $pageTitle = trans_admin('add_category');

        meta_data(trans_admin('categories'), trans_admin('categories'), [
            $this->routeUrl => trans_admin('categories'),
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'asRoute'));
    }

    public function data(Request $request)
    {
        $rows = new $this->model();

        $rows = $this->filter($request, $rows);

        $rows = $this->sort($request, $rows);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $rows = $rows->paginate($limit);

        $data = CategoriesResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function edit($id)
    {
        $category = $this->model::findOrFail($id);

        $pageTitle = trans_admin('edit_category');

        meta_data(trans_admin('categories'), trans_admin('categories'), [
            $this->routeUrl => trans_admin('categories'),
            '' => $pageTitle
        ]);

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'category'));
    }


    public function store(StoreCategoryRequest $request)
    {
        $id = $request->id;

        if ($id) {
            $store = $this->model::findOrFail($id);
        } else {
            $store = new $this->model();
        }

        $store->name = $request->name;
        $store->fontawesome_icon = $request->fontawesome_icon;
        $store->icon = $request->icon;
        $store->save();

        Cache::forget('categories');
        return $this->successResponse($store);
    }

    public function destroy($id)
    {
        $delete = $this->model::findOrFail($id)->delete();

        Cache::forget('categories');

        return $this->deleteResponse($delete);
    }

    public function all()
    {
        return $this->response(CategoriesResource::collection($this->model::categories()));
    }
}
