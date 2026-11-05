<?php


namespace App\Http\Controllers\AdminPanel\Admin;


trait AdminTrait
{
    public function filter($request, $model)
    {
        $filter = isset($request->filter) ? json_decode($request->filter) : $request;

        if (isset($filter->searchText)) {
            $model = $model->where(function ($query) use ($filter) {
                $text = $filter->searchText;
                $query->where('full_name', 'LIKE', "%$text%");
                $query->orwhere('email', 'LIKE', "%$text%");
            });
        }

        if (isset($filter->role)) {
            $model = $model->where(function ($query) use ($filter) {
                $text = $filter->role;
                $query->where('role_id', $text);
            });
        }

        return $model;
    }

    public function sort($request, $model)
    {
        $orderBy = json_decode($request->orderBy);
        $column = isset($orderBy->column) ? $orderBy->column : 'id';
        $direction = isset($orderBy->direction) ? $orderBy->direction : 'desc';
        $model = $model->orderBy($column, $direction);

        return $model;
    }
}
