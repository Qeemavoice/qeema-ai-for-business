<?php

namespace App\Models;

use App\Services\CurrencyHelper;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $guarded = [];
    protected $appends = ['show_line_total', 'show_unit_price', 'show_item'];

    public function getShowLineTotalAttribute($data)
    {
        return CurrencyHelper::getSymbol() . $this->line_total;
    }

    public function getShowUnitPriceAttribute($data)
    {
        return CurrencyHelper::getSymbol() . $this->unit_price;
    }

    public function getShowItemAttribute($data)
    {
        $item = $this->item;

        if ($this->itemable_type === get_class(new Voice()))
            $item = trans_admin('scenario');

        return $item;
    }

    public function itemable()
    {
        return $this->morphTo();
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function details()
    {
        return $this->hasOne(OrderItemDetail::class, 'item_id');
    }
}
