<?php

namespace App\Http\Controllers\AdminPanel\Form;

use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Form\StoreFormRequest;
use App\Http\Resources\AdminPanel\Form\FormsResource;
use App\Models\Form;
use App\Models\FormField;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FormController extends CoreController
{
    use FormTrait;

    public function __construct(Form $form)
    {
        $this->dirView = 'forms';
        $this->asRoute = 'form';
        $this->route = 'forms';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($form);
    }

    public function index()
    {
        $pageTitle = trans_admin('forms');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function data(Request $request)
    {
        $forms = new $this->model();

        $forms = $this->filter($request, $forms);

        $forms = $this->sort($request, $forms);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $forms = $forms->with('page')->paginate($limit);

        $data = FormsResource::collection($forms);
        $meta = collect($forms)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }


    public function create()
    {
        $pageTitle = trans_admin('add_form');

        meta_data(trans_admin('forms'), trans_admin('forms'), [
            $this->routeUrl => trans_admin('forms'),
            '' => $pageTitle
        ]);

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create',
            compact('pageTitle')
        );
    }

    public function edit($id)
    {
        $form = $this->model::with('fields')->findOrFail($id);

        $pageTitle = trans_admin('edit_form');

        meta_data(trans_admin('forms'), trans_admin('forms'), [
            $this->routeUrl => trans_admin('forms'),
            '' => $pageTitle
        ]);

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create',
            compact('pageTitle', 'form')
        );
    }


    public function store(StoreFormRequest $request)
    {
        $form = DB::transaction(function () use ($request) {
            $id = $request->id;

            if ($id) {
                $form = $this->model::findOrFail($id);
            } else {
                $form = $this->model::where('page_id', $request->page)->first();
                if (!$form)
                    $form = new $this->model();
            }

            $form->title = $request->title;
            $form->page_id = $request->page;
            $form->save();


            FormField::where('form_id', $id)->delete();

            if ($request->formInputFields) {
                foreach ($request->formInputFields as $field) {
                    if (isset($field['label'])) {
                        FormField::create([
                            'form_id' => $form->id,
                            'label' => $field['label'],
                            'input_field_id' => $field['input_field_id'],
                            'options' => isset($field['listOfOptions']) ? json_encode($field['listOfOptions']) : null,
                        ]);
                    }
                }
            }

            return $form;
        });

        return $this->successResponse($form);
    }

    public function destroy($id)
    {
        $form = $this->model::findOrFail($id)->delete();
        return $this->deleteResponse($form);
    }
}
