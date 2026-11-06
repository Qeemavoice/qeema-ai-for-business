<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceDetails extends Model
{
    use HasFactory;

    protected $guarded = [];


    public function getCreatedAtAttribute($data)
    {
        return Carbon::parse($data)->format(DATE_DMY_FORMAT);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class, 'invoice_id');
    }

    public function itemable()
    {
       return $this->morphTo(__FUNCTION__, 'itemable_type', 'itemable_id');
    }
}
