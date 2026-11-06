<?php


namespace App\Http\Controllers\AdminPanel\OrderCancellationRequest;


trait OrderCancellationRequestTrait
{
    public function filter($request, $model)
    {
        if ($request->id) {
            $model = $model->where('id', (int)$request->id);
        }

        if ($request->filter) {
            $model = $model->where(function ($query) use ($request) {
                $text = $request->filter;
            });
        }
        return $model;
    }

    public function sort($request, $model)
    {
        if ($request->has('sort')) {
            $sort = json_decode($request->sort, true);
            $fieldName = isset($sort['fieldName']) && strlen($sort['fieldName']) ? $sort['fieldName'] : 'id';
            $order = $sort['order'] && strlen($sort['order']) ? $sort['order'] : 'desc';
            $model = $model->orderBy($fieldName, $order);
        }
        return $model;
    }
}
