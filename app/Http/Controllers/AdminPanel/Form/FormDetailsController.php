<?php

namespace App\Http\Controllers\AdminPanel\Form;

use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Resources\AdminPanel\Form\FormAnswersResource;
use App\Models\Form;
use App\Models\FormAnswer;
use Illuminate\Http\Request;

class FormDetailsController extends CoreController
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

    public function index($formId)
    {
        $form = Form::with('page','fields','answers')->findOrFail($formId);

        $pageTitle = trans_admin('forms');

        meta_data($pageTitle, $pageTitle, [
            $this->routeUrl => $pageTitle,
            '#' => $form->title
        ]);

        $asRoute = $this->asRoute;


        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.details.index',
            compact('pageTitle', 'asRoute', 'form')
        );
    }

    public function data(Request $request)
    {



        $rows =  new FormAnswer();

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $rows = $rows->groupBy('token')->paginate($limit);

        $data = FormAnswersResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }


}
