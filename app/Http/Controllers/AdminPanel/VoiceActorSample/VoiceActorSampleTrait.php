<?php


namespace App\Http\Controllers\AdminPanel\VoiceActorSample;


trait VoiceActorSampleTrait
{
    public function filter($request, $model)
    {
        $filter = isset($request->filter) ? json_decode($request->filter) : $request;

        if (isset($filter->searchText)) {

            $searchText = $filter->searchText;
            if (is_numeric($searchText)) {
                $model = $model->where('id', (int)$searchText);
            } else {
                $model = $model->where(function ($query) use ($searchText) {
                    $text = strtolower($searchText);
                    $query->whereRaw("JSON_VALID(title) AND LOWER(JSON_UNQUOTE(JSON_EXTRACT(title, '$.en'))) LIKE ?", ["%$text%"])
                        ->orWhereRaw("JSON_VALID(title) AND JSON_UNQUOTE(JSON_EXTRACT(title, '$.ar')) LIKE ?", ["%$text%"])
                        ->orWhereRaw("NOT JSON_VALID(title) AND title LIKE ?", ["%$text%"]);
                });
            }
        }

        $model = $model->where('is_sample', YES);
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
