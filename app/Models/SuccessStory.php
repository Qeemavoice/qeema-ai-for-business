<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SuccessStory extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'stats' => 'array',
        'paragraphs' => 'array',
        'highlights' => 'array',
        'clips' => 'array',
        'is_featured' => 'boolean',
        'is_published' => 'boolean',
        'permission_confirmed' => 'boolean',
        'imported_at' => 'datetime',
    ];

    public function scopePublic($query)
    {
        return $query->where('is_published', true)
            ->where('permission_confirmed', true);
    }
}
