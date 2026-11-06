<?php


namespace App\Http\Controllers\AdminPanel\Order;


trait OrderTrait
{
    public function filter($request, $model)
    {
        if ($request->filter) {
            $filter = json_decode($request->filter);

            if (isset($filter->id)) {
                $model = $model->where('id', $filter->id);
            }

            if (isset($filter->searchText)) {

                $model = $model->where(function ($query) use ($filter) {
                    $text = $filter->searchText;
                    $query->where('customer_full_name', 'LIKE', "%$text%");
                    $query->orwhere('customer_email', 'LIKE', "%$text%");
                });
            }
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
