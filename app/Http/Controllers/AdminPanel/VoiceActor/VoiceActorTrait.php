<?php


namespace App\Http\Controllers\AdminPanel\VoiceActor;


trait VoiceActorTrait
{
    public function filter($request, $model)
    {
        $filter = isset($request->filter) ? json_decode($request->filter) : $request;

        if (isset($filter->searchText)) {

            $searchText = trim($filter->searchText);

            if (is_numeric($searchText)) {
                $model = $model->where('id', (int)$searchText);
            } else {
                $model = $model->where(function ($query) use ($filter) {
                    $text = strtolower($filter->searchText);
                    $query->whereRaw("JSON_VALID(full_name) AND LOWER(JSON_UNQUOTE(JSON_EXTRACT(full_name, '$.en'))) LIKE ?", ["%$text%"])
                        ->orWhereRaw("JSON_VALID(full_name) AND JSON_UNQUOTE(JSON_EXTRACT(full_name, '$.ar')) LIKE ?", ["%$text%"])
                        ->orWhereRaw("NOT JSON_VALID(full_name) AND full_name LIKE ?", ["%$text%"])
                        ->orwhere('email', 'LIKE', "%$text%")
                        ->orwhere('mobile', 'LIKE', "%$text%");
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
