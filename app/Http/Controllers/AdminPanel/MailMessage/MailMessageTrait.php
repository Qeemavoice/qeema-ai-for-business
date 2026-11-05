<?php


namespace App\Http\Controllers\AdminPanel\MailMessage;


use App\Models\MailMessage;

trait MailMessageTrait
{
    public function filter($request, $model)
    {
        $filter = isset($request->filter) ? json_decode($request->filter) : $request;

        if (isset($filter->searchText)) {
            $model = $model->where(function ($query) use ($filter) {
                $text = $filter->searchText;
                $query->where('full_name', 'LIKE', "%$text%");
                $query->orwhere('to', 'LIKE', "%$text%");
                $query->orwhere('subject', 'LIKE', "%$text%");
                $query->orwhere('content', 'LIKE', "%$text%");
            });
        }
        if ($filter->status == 'draft') {
            $model = $model->where('status', MailMessage::DRAFT_STATUS);
        }
        if ($filter->status == 'important') {
            $model = $model->where('status', MailMessage::MARKED_STATUS);
        }
        if ($filter->status == 'trash') {
            $model = $model->onlyTrashed();
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
