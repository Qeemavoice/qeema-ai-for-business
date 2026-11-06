<?php


namespace App\Http\Resources\App\Dashboard\RatingCriteria;


use Illuminate\Http\Resources\Json\JsonResource;

class RatingCriteriaResources extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $request->translate == false ? $this->name : $this->translations['name'],
            'group_id' => $this->group_id,
        ];
    }
}
