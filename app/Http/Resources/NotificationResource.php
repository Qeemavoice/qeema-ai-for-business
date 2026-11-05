<?php


namespace App\Http\Resources;


use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            "title" => $this->data->title,
            "body" => $this->data->body,
            "action" => $this->data->action,
            "created_at" => Carbon::parse($this->created_at)->diffForHumans(),
        ];
    }

}
