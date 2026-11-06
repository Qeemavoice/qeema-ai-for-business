<?php


namespace App\Http\Controllers\AdminPanel\Role;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Role\StoreRoleRequest;
use App\Http\Resources\AdminPanel\Role\RolesResources;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use App\Models\Role as Model;

class RoleController extends CoreController
{
    use RoleTrait;

    public function __construct(Model $role)
    {
        $this->dirView = 'roles';
        $this->asRoute = 'role';
        $this->route = 'roles';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($role);
    }

    public function index()
    {
        $pageTitle = trans_admin('roles');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);
        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index',compact('pageTitle','asRoute'));
    }

    public function data(Request $request)
    {
        $roles = new $this->model();

        $roles = $roles->select('id', 'name', 'created_at');

        $roles = $this->filter($request, $roles);

        $roles = $this->sort($request, $roles);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;

        $roles = $roles->with('permissions')->paginate($limit);

        $data = RolesResources::collection($roles);
        $meta = collect($roles)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function create()
    {
        $pageTitle = trans_admin('add_role');

        meta_data(trans_admin('roles'), trans_admin('roles'), [
            $this->routeUrl => trans_admin('roles'),
            '' => $pageTitle
        ]);

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle'));
    }

    public function edit($id)
    {
        $pageTitle = trans_admin('edit_role');


        meta_data(trans_admin('roles'), trans_admin('roles'), [
            $this->routeUrl => trans_admin('roles'),
            '' => $pageTitle
        ]);
        $role = $this->model::with('permissions')->findOrFail($id);
        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle','role'));
    }

    public function store(StoreRoleRequest $request)
    {
        $store = DB::transaction(function () use ($request) {
            $id = $request->id;

            if ($id) {
                $role = Role::findOrFail($id);
            } else {
                $role = new Role();
            }

            $role->name = json_encode($request->name);
            $role->guard_name = config('auth.defaults.guard');
            $role->save();

            if ($request->has('permissions'))
                $role->syncPermissions($request->permissions);

            return $role;
        });

        Cache::forget('rolesWithPermissions');

        return $this->successResponse($store);
    }

    public function destroy($id)
    {
        return $this->deleteResponse($this->model::findOrFail($id)->delete());
    }

    public function all()
    {
        return $this->response(RolesResources::collection($this->model::getAll()));
    }
}
