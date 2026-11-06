<?php


namespace App\Http\Controllers\AdminPanel\Role;


use App\Http\Controllers\AdminPanel\Admin\AdminTrait;
use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Resources\AdminPanel\Admin\AdminsResource;
use App\Models\Role as Model;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoleDetailsController extends CoreController
{
    use AdminTrait;

    public function __construct(Model $role)
    {
        $this->dirView = 'roles';
        $this->asRoute = 'role';
        $this->route = 'roles';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($role);
    }

    public function index($id)
    {
        $role = $this->model::with('permissions')->findorFail($id);

        $pageTitle = trans_admin('view_role');

        meta_data(trans_admin('roles'), trans_admin('roles'), [
            $this->routeUrl => trans_admin('roles'),
            '' => $pageTitle
        ]);
        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.details', compact('pageTitle', 'asRoute', 'role'));
    }

    public function adminsAssigned($id, Request $request)
    {
        $users = new User();

        $users = $this->filter($request, $users);

        $users = $users->where('role_id', $id)->paginate(ADMIN_PER_PAGE);

        $data = AdminsResource::collection($users);
        $meta = collect($users)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function adminsAssignedDestroy($roleId, $userId)
    {
        $delete = DB::transaction(function () use ($roleId, $userId) {
            $user = User::findOrFail($userId);
            $user->role_id = null;
            $user->save();

            return $user->removeRole($roleId);
        });

        return $this->deleteResponse($delete);
    }
}
