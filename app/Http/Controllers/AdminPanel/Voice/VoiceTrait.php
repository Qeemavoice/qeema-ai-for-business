<?php


namespace App\Http\Controllers\AdminPanel\Voice;


trait VoiceTrait
{
    public function filter($request, $model)
    {
        $filter = isset($request->filter) ? json_decode($request->filter) : $request;

        if (isset($filter->searchText)) {

            $searchText = trim($filter->searchText);

            if (is_numeric($searchText)) {
                $model = $model->where('id', (int)$searchText);
            } else {
                $text = strtolower($searchText);
                $model = $model->where(function ($query) use ($text) {
                    $query->whereRaw(
                        "JSON_VALID(title) AND LOWER(CAST(JSON_UNQUOTE(JSON_EXTRACT(title, '$.en')) AS CHAR)) LIKE ?",
                        ["%$text%"]
                    )
                        ->orWhereRaw(
                            "JSON_VALID(title) AND LOWER(CAST(JSON_UNQUOTE(JSON_EXTRACT(title, '$.ar')) AS CHAR)) LIKE ?",
                            ["%$text%"]
                        )
                        ->orWhereRaw(
                            "NOT JSON_VALID(title) AND LOWER(title) LIKE ?",
                            ["%$text%"]
                        );
                });
            }
        }

        $model = $model->where('is_sample', null);

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
