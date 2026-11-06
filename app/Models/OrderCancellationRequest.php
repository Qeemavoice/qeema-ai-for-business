<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderCancellationRequest extends Model
{
    use HasFactory, HasTimestamps;

    protected $guarded = [];

    public function from()
    {
        return $this->belongsTo(User::class, 'from_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function status()
    {
        return $this->belongsTo(RequestStatus::class, 'request_status_id');
    }
}
