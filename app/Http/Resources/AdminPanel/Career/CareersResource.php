<?php


namespace App\Http\Resources\AdminPanel\Career;


use App\Models\Career;
use Illuminate\Http\Resources\Json\JsonResource;

class CareersResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'job_title' => $this->job_title,
            'salary' => $this->min_salary . '-' . $this->max_salary,
            'workplace_type' => $this->show_workplace_type,
            'type' => $this->show_type,
            'created_at' => $this->created_at,
        ];
    }
}
