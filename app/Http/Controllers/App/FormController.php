<?php

namespace App\Http\Controllers\App;

use App\Models\FormAnswer;
use App\Models\InputField;
use Illuminate\Http\Request;

class FormController extends CoreController
{
    protected $dirView;

    public function __invoke(Request $request)
    {
        $data = $request->formData;

        $_data = [];
        $store = false;

        $token = generate_uniq_id(40);

        foreach ($data as $key => $value) {
            $_data[] = [
                'form_field_id' => $value['form_field_id'],
                'answer' => (is_array($value['name']) || $value['input_field_id'] === InputField::FILE) ? json_encode($value['name']) : $value['name'],
                'token' => $token,
                'user_id' => user() ? user()->getAuthIdentifier() : null,
                'form_id' => $request->formId,
            ];
        }

        if (count($_data) > 0)
            $store = FormAnswer::insert($_data);

        return $this->successResponse($store);
    }
}
