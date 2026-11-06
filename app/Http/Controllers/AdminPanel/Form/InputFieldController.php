<?php


namespace App\Http\Controllers\AdminPanel\Form;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Models\InputField;

class InputFieldController extends CoreController
{

    public function __construct(InputField $field)
    {
        $this->dirView = 'input-fields';
        $this->asRoute = 'form.inputField';
        $this->route = 'input-fields';

        parent::__construct($field);
    }

    public function all()
    {
        return $this->response($this->model::inputFields());
    }

//    public function data() {
//
//    }
}
