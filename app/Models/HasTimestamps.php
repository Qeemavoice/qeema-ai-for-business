<?php

namespace App\Models;

use Carbon\Carbon;

trait HasTimestamps
{
    public function getCreatedAtAttribute($date)
    {
        if (!is_null($date))
            return Carbon::parse($date)->toDateTimeString();

        return null;
    }

    public function getUpdatedAtAttribute($date)
    {
        if (!is_null($date))
            return Carbon::parse($date)->toDateTimeString();

        return null;
    }
}
