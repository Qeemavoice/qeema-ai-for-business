<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Model;

class GuideDownload extends Model
{
    use HasTimestamps;

    protected $guarded = [];

    public function guide()
    {
        return $this->belongsTo(Guide::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

}
