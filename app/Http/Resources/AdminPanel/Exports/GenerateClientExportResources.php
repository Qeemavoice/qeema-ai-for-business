<?php


namespace App\Http\Resources\AdminPanel\Exports;


use Illuminate\Http\Resources\Json\JsonResource;

class GenerateClientExportResources extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'mobile' => $this->mobile,
        ];
    }
}
