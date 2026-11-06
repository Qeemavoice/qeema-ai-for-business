<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class UserStatus extends Model
{
    public const PENDING = 1;
    public const ACCEPTED = 2;
    public const REJECTED = 3;
    public const DEACTIVATED = 4;
    public const BLOCKED = 5;
    public const ACTIVATED = 6;
    public const FINISHED = 7;


    use HasTranslations, HasTimestamps;

    public $guarded = [];
    public $translatable = ['name', 'description'];

    // Relation

    public function users()
    {
        return $this->hasMany(User::class, 'status_id');
    }

    public static function getUserStatus()
    {
        return Cache::remember('userStatus', CACHE_TTL, function () {
            return self::select('id', 'name')->get();
        });
    }
}
