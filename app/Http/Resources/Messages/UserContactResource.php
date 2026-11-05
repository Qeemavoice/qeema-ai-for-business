<?php


namespace App\Http\Resources\Messages;


use Illuminate\Http\Resources\Json\JsonResource;

class UserContactResource extends JsonResource
{
    public function toArray($request)
    {
        $modalTitle = null;
        $modalType = null;
        $modalId = null;

        $modalTitle = $this->title;
        $modalId = $this->order_id;


        return [
            'modal_title' => $modalTitle,
            'modal_id' => $modalId,
            'modal_type' => $modalType,

//            'project_title' => $modalTitle,
//            'project_id' => $this->id,
            // 'users' => UserMessageResource::collection($this->usersMessages)
        ];
    }
}
