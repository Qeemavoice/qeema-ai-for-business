<?php


namespace App\Http\Controllers\App\Voice;


use App\Models\VoiceStatus;

trait VoiceTrait
{
    public function filter($request, $model)
    {
        $filter = isset($request->filter) ? json_decode($request->filter) : $request;


        if (isset($filter->searchText)) {
            $model = $model->where(function ($query) use ($filter) {
                $text = $filter->searchText;
                $query->where('title', 'LIKE', "%$text%");
            });
        }
        if (isset($filter->dialect) && $filter->dialect != 0) {
            $model = $model->where('dialect_id', $filter->dialect);
        }
        if (isset($filter->language) && $filter->language != 0) {
            $model = $model->whereHas('dialect', function ($query) use ($filter) {
                $query->where('language_id', $filter->language);
            });
        }
        if (isset($filter->type) && $filter->type != 0) {
            $model = $model->where('voice_type_id', $filter->type);
        }
        if (!empty($filter->categories) && is_array($filter->categories)) {
            $model = $model->whereHas('categories', function ($query) use ($filter) {
                $query->whereIn('category_id', $filter->categories);
            });
        }

        $model = $model->where('voice_status_id', VoiceStatus::ACCEPTED);
        //  $model = $model->orwhere('is_sample', YES);

        return $model;
    }

    public function sort($request, $model)
    {
        $orderBy = json_decode($request->orderBy);
        $column = isset($orderBy->column) ? $orderBy->column : 'id';
        $direction = isset($orderBy->direction) ? $orderBy->direction : 'desc';

        if ($column === 'most_requested') {
            $column = 'number_of_orders';
        }
//        if ($column === 'fastest_delivery') {
//
//        }
//        if ($column === 'most_popular') {
//
//        }
        if ($column === 'lowest_price') {
            $direction = 'asc';
            $column = 'price_per_minute';
        }
        if ($column === 'highest_price') {
            $column = 'price_per_minute';
        }

        $model = $model->orderBy($column, $direction);
        return $model;
    }
}
