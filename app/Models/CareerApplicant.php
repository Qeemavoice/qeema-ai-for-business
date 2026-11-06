<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Model;

class CareerApplicant extends Model
{
    protected $guarded = [];


    public function job()
    {
        return $this->belongsTo(Career::class, 'job_id');
    }
}
