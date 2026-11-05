<?php

namespace App\Http\Controllers\AdminPanel\Admin;

use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Admin\StoreAdminRequest;
use App\Http\Resources\AdminPanel\Admin\AdminsResource;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\UserType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Role;
use App\Models\UserStatus;

class AdminController extends CoreController
{
    use AdminTrait;

    public function __construct(User $user)
    {
        $this->dirView = 'admins';
        $this->asRoute = 'admin';
        $this->route = 'admins';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($user);
    }

    public function index()
    {
        $pageTitle = trans_admin('admins');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function data(Request $request)
    {
        $admins = new $this->model();

        $admins = $this->filter($request, $admins);

        $admins = $this->sort($request, $admins);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $admins = $admins->userTypeAdmin()->paginate($limit);

        $data = AdminsResource::collection($admins);
        $meta = collect($admins)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }


    public function create()
    {
        $pageTitle = trans_admin('add_admin');

        meta_data(trans_admin('admins'), trans_admin('admins'), [
            $this->routeUrl => trans_admin('admins'),
            '' => $pageTitle
        ]);

        $roles = Role::getAll();
        $DIR_FILE_UPLOADS = User::DIR_IMAGE_UPLOADS;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'roles', 'DIR_FILE_UPLOADS'));
    }

    public function edit($id)
    {
        $admin = $this->model::userTypeAdmin()->findOrFail($id);

        $pageTitle = trans_admin('edit_admin');

        meta_data(trans_admin('admins'), trans_admin('admins'), [
            $this->routeUrl => trans_admin('admins'),
            '' => $pageTitle
        ]);

        $roles = Role::getAll();
        $DIR_FILE_UPLOADS = User::DIR_IMAGE_UPLOADS;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'admin', 'roles', 'DIR_FILE_UPLOADS'));
    }


    public function store(StoreAdminRequest $request)
    {
        $store = DB::transaction(function () use ($request) {
            $id = $request->id;

            if ($id) {
                $admin = $this->model::findOrFail($id);
                DB::table('model_has_roles')->where('model_id', $id)->delete();
            } else {
                $admin = new $this->model();
                $admin->password = bcrypt($request->password);
                $admin->uniq_id = generate_uniq_id();
            }

            $admin->full_name = $request->first_name . ' ' . $request->last_name;
            $admin->email = $request->email;
            $admin->mobile = $request->mobile;
            $admin->image = $request->personal_photo;
            $admin->user_type_id = UserType::ADMIN;
            $admin->role_id = $request->role;
            $admin->status_id = UserStatus::ACCEPTED;
            $admin->save();

            $admin->assignRole($request->input('role'));

            UserProfile::updateOrCreate([
                'user_id' => $admin->id,
            ], [
                'user_id' => $admin->id,
            ]);

            return $admin;
        });

        return $this->successResponse($store);
    }

    public function destroy($id)
    {
        $admin = $this->model::findOrFail($id);
        $admin->update([
            'email' => time() . '_' . $admin->email,
            'mobile' => time() . '_' . $admin->mobile,
        ]);
        $delete = $admin->delete();
        return $this->deleteResponse($delete);
    }
}
