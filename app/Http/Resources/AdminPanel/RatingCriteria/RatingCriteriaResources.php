<?php


namespace App\Http\Resources\AdminPanel\RatingCriteria;


use App\Http\Resources\AdminPanel\RatingGroup\RatingGroupsResource;
use Illuminate\Http\Resources\Json\JsonResource;

class RatingCriteriaResources extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $request->translate == false ? $this->name : $this->translations['name'],
            'group_id' => $this->group_id,
            'group' => $this->group ? $this->group->name : '-',
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
