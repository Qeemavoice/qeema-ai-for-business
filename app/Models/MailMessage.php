<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MailMessage extends Model
{
    use HasFactory, SoftDeletes;

    public $guarded = [];

    public $appends = [
        'format1_created_at',
        'humans_created_at',
        'format2_created_at',
        'show_status',
        'show_source',
    ];

    public const MARKED_STATUS = 1;
    public const DRAFT_STATUS = 2;


    public const CONTACT_US_FORM_SOURCE = 1;

    public static function statues()
    {
        return [
            self::MARKED_STATUS => trans_admin('important'),
            self::DRAFT_STATUS => trans_admin('draft'),
        ];
    }

    public static function sources()
    {
        return [
            self::CONTACT_US_FORM_SOURCE => trans_admin('contact_us_form'),
        ];
    }

    public function getShowSourceAttribute()
    {
        return @self::sources()[$this->source];
    }

    public function getShowStatusAttribute()
    {
        return @self::statues()[$this->status];
    }

    public function getFormat1CreatedAtAttribute()
    {
        $date = $this->created_at;

        if (Carbon::parse($this->created_at)->toDateString() == Carbon::now()->toDateString())
            $date = Carbon::parse($this->created_at)->format('h:m A');

        if (Carbon::parse($this->created_at)->toDateString() < Carbon::now()->toDateString())
            $date = Carbon::parse($this->created_at)->format('M d');

        if (Carbon::parse($this->created_at)->year < Carbon::now()->year)
            $date = Carbon::parse($this->created_at)->format('d/m/Y');

        return $date;
    }

    public function getHumansCreatedAtAttribute()
    {
        return Carbon::parse($this->created_at)->diffForHumans();
    }

    public function getFormat2CreatedAtAttribute()
    {
        return Carbon::parse($this->created_at)->format('d M Y, h:m a');
    }
}
