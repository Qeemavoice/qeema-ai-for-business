<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Model;

class VoiceCategory extends Model
{
    use HasTimestamps;

    protected $guarded = [];

    public static function sync(array $data, $id)
    {
        self::where('voice_id', $id)->delete();

        $list = [];

        foreach ($data as $key => $value) {
            $list[] = [
                'voice_id' => $id,
                'category_id' => $value,
            ];
        }

        self::insert($list);
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function voice()
    {
        return $this->belongsTo(Voice::class, 'voice_id');
    }
}
