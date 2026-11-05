<?php


namespace App\Http\Controllers\AdminPanel\Admin;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Models\Role as Model;


class ClientDetailsController extends CoreController
{
    use AdminTrait;

    public function __construct(Model $role)
    {
        $this->dirView = 'clients';
        $this->asRoute = 'client';
        $this->route = 'clients';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($role);
    }

    public function index($id)
    {
        $admin = $this->model::findOrFail($id);

        $pageTitle = trans_admin('details');
        meta_data(trans_admin('admins'), trans_admin('admins'), [
            $this->routeUrl => trans_admin('admins'),
            '' => $admin->full_name
        ]);
        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.details', compact('pageTitle','admin'));
    }

}
