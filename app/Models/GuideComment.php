<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuideComment extends Model
{
    use HasFactory, HasTimestamps;

    protected $guarded = [];

    protected $appends = ['show_status', 'bool_status'];

    public function getBoolStatusAttribute()
    {
        $status = $this->status;
        $resulte = false;

        if ($status == YES)
            $resulte = true;

        if ($status == NO)
            $resulte = false;

        return $resulte;
    }


    public function getShowStatusAttribute()
    {
        $status = $this->status;
        $resulte = trans_admin('pending');

        if ($status == YES)
            $resulte = trans_admin('accepted');

        if ($status == NO)
            $resulte = trans_admin('rejected');

        return $resulte;
    }


    public function guide()
    {
        return $this->belongsTo(Guide::class);
    }
}
