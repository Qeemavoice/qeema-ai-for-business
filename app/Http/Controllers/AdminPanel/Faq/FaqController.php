<?php


namespace App\Http\Controllers\AdminPanel\Faq;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Faq\StoreFaqRequest;
use App\Http\Resources\AdminPanel\Faq\FaqsResource;
use App\Models\Faq;
use App\Models\Voice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class FaqController extends CoreController
{
    use FaqTrait;

    public function __construct(Faq $faq)
    {
        $this->dirView = 'faqs';
        $this->asRoute = 'faq';
        $this->route = 'faqs';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($faq);
    }

    public function index()
    {
        $pageTitle = trans_admin('faqs');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function create()
    {
        $pageTitle = trans_admin('add_faq');

        meta_data(trans_admin('faqs'), trans_admin('faqs'), [
            $this->routeUrl => trans_admin('faqs'),
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

        $data = FaqsResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function edit($id)
    {
        $faq = $this->model::findOrFail($id);

        $pageTitle = trans_admin('edit_faq');

        meta_data(trans_admin('faqs'), trans_admin('faqs'), [
            $this->routeUrl => trans_admin('faqs'),
            '' => $pageTitle
        ]);

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'faq'));
    }


    public function store(StoreFaqRequest $request)
    {
        $id = $request->id;

        if ($id) {
            $store = $this->model::findOrFail($id);
        } else {
            $store = new $this->model();
        }

        $store->title = $request->title;
        $store->details = $request->details;
        $store->save();
        Cache::forget('faqs');
        return $this->successResponse($store);
    }

    public function destroy($id)
    {
        $delete = $this->model::findOrFail($id)->delete();
        Cache::forget('faqs');
        return $this->deleteResponse($delete);
    }

    public function search(Request $request) {
        $filter = $request->input('query');

        $model = Faq::query();

        $data = [];

        if ($filter) {

            $lang = get_locale();

            $data = $model->where(function ($query) use ($filter, $lang) {
                $query->where("title->{$lang}", 'LIKE', "%$filter%");
            });

            $data = $data->get();
        }


        return $this->response([
            'data' => $data,
        ]);
    }
}
