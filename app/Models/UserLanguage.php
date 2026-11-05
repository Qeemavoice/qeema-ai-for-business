<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserLanguage extends Model
{
    use HasFactory;

    public $guarded = [];


    public static function sync(array $data, $id)
    {
        self::where('user_id', $id)->delete();

        $list = [];

        foreach ($data as $key => $value) {
            $list[] = [
                'user_id' => $id,
                'language_id' => $value,
            ];
        }

        self::insert($list);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function language()
    {
        return $this->belongsTo(Language::class, 'language_id');
    }
}
