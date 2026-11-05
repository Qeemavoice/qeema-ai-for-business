<?php


namespace App\Http\Resources\AdminPanel\Guide;


use Illuminate\Http\Resources\Json\JsonResource;

class GuidesCommentsResource extends JsonResource
{
    public function toArray($request)
    {
        return [
          'id' => $this->id,
          'name' => $this->name,
          'email' => $this->email,
          'details' => $this->details,
          'status' => $this->status,
          'show_status' => $this->show_status,
          'boolStatus' => $this->boolStatus,
          'created_at' => $this->created_at,
        ];
    }
}
