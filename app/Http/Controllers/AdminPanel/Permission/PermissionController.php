<?php


namespace App\Http\Controllers\AdminPanel\Permission;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\Permission\StorePermissionRequest;
use App\Http\Resources\AdminPanel\Permission\PermissionResource;
use App\Http\Resources\AdminPanel\Permission\PermissionsResources;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PermissionController extends CoreController
{
    use PermissionTrait;

    public function __construct(Permission $permission)
    {
        $this->dirView = 'permissions';
        $this->asRoute = 'permission';
        $this->route = 'permissions';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($permission);
    }

    public function index()
    {
        $pageTitle = trans_admin('permissions');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);
        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function data(Request $request)
    {
        $permissions = new $this->model();

        $permissions = $this->filter($request, $permissions);

        $permissions = $this->sort($request, $permissions);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;

        $permissions = $permissions->paginate($limit);

        $data = PermissionsResources::collection($permissions);
        $meta = collect($permissions)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function create()
    {
        $pageTitle = trans_admin('add_permission');

        meta_data(trans_admin('permissions'), trans_admin('permissions'), [
            $this->routeUrl => trans_admin('permissions'),
            '' => $pageTitle
        ]);

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle'));
    }

    public function edit($id)
    {
        $permission = $this->model::findOrFail($id);

        $pageTitle = trans_admin('edit_permission');

        meta_data(trans_admin('permissions'), trans_admin('permissions'), [
            $this->routeUrl => trans_admin('permissions'),
            '' => $pageTitle
        ]);


        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'permission'));
    }

    public function store(StorePermissionRequest $request)
    {
        $id = $request->id;

        if ($id) {
            $permission = $this->model::findOrFail($id);
        } else {
            $permission = new $this->model();
        }

        $permission->name = $request->unique_name;
        $permission->show_name = $request->show_name;
        $permission->guard_name = Auth::getDefaultDriver();
        $permission->save();

        return $this->successResponse($permission);
    }

    public function destroy($id)
    {
        $delete = $this->model::findOrFail($id)->delete();
        return $this->deleteResponse($delete);
    }

    public function all()
    {
        return $this->response(PermissionResource::collection($this->model::with('group')->get()));
    }
}
