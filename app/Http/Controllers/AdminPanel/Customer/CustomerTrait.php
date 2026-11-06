<?php


namespace App\Http\Controllers\AdminPanel\Customer;


trait CustomerTrait
{
    public function filter($request, $model)
    {
        $filter = isset($request->filter) ? json_decode($request->filter) : $request;

        if (isset($filter->searchText)) {
            $model = $model->where(function ($query) use ($filter) {
                $text = $filter->searchText;
                $query->where('name', 'LIKE', "%$text%");
                $query->orwhere('alt', 'LIKE', "%$text%");
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
