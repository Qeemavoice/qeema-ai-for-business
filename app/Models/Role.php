<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;
use Spatie\Translatable\HasTranslations;

class Role extends Model
{
    use HasTimestamps, HasTranslations, SoftDeletes;

    public $translatable = ['name'];

    const ADMINISTRATION = 1;

    protected $table = 'roles';

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $fillable = [
        'name',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public static function getAllWithPermissions()
    {
        return Cache::remember('rolesWithPermissions', CACHE_TTL, function () {
            return self::with('permissions')->get();
        });
    }

    public static function getAll()
    {
        return Cache::remember('roles', CACHE_TTL, function () {
            return self::select('id', 'name')->get();
        });
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_has_permissions', 'role_id', 'permission_id');
    }


}
