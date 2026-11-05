<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Translatable\HasTranslations;

class RatingGroup extends Model
{
    use SoftDeletes, HasTranslations, HasTimestamps;

    protected $guarded = [];
    public $translatable = ['name'];
    public $appends = ['active'];

    public function getActiveAttribute()
    {
        return $this->is_active == YES ? 'active' : 'deactive';
    }

    public function criterias()
    {
        return $this->hasMany(RatingCriteria::class, 'group_id');
    }
}
