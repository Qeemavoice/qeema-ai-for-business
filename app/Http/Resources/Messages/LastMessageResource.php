<?php


namespace App\Http\Resources\Messages;


use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;
use \Illuminate\Support\Str;

class LastMessageResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'message' => Str::limit($this->message,65),
            'created_at_human' => Carbon::parse($this->created_at)->diffForHumans(),
        ];
    }
}