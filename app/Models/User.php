<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Translatable\HasTranslations;


class User extends Authenticatable
{
    // HasApiTokens: Bearer tokens of the new UI (Sanctum, personal_access_tokens table)
    use HasFactory, Notifiable, HasRoles, SoftDeletes, HasTimestamps, HasTranslations, HasApiTokens;

    public const DIR_IMAGE_UPLOADS = 'users';

    protected $guarded = [];
    public $translatable = ['full_name'];

    protected $appends = [
        'first_name',
        'last_name',
        'show_full_name',
        'slug',
        'image_url',
        'show_last_login',
        'show_created_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];


    public function receivesBroadcastNotificationsOn()
    {
        return 'App.User.' . $this->id;
    }

    public function getImageUrlAttribute()
    {
        if (is_null($this->image)) {

            if (isset($this->user->profile) && $profile = $this->user->profile)
                $userImage = $profile->gender == MALE ? asset_media('avatar', 'male.jpg') : asset_media('avatar', 'female.jpg');
            else
                $userImage = admin_image_default();

        } else {
            $userImage = asset_upload(self::DIR_IMAGE_UPLOADS . '/' . $this->image);
            if (filter_var($this->image, FILTER_VALIDATE_URL)) {
                $userImage = $this->image;
            }
        }

        return $userImage;
    }


    public function getVerifyAccountAttribute()
    {
        $status = true;
        if (is_null($this->email_verified_at) && is_null($this->mobile_verified_at))
            $status = false;
        return $status;
    }

    public function getShowCreatedAtAttribute()
    {
        $createdAt = $this->created_at;
        return Carbon::parse($createdAt)->format(CREATED_AT_FORMAT);
    }

    public function getShowLastLoginAttribute()
    {
        $lastLogin = '-';

        if (!is_null($this->last_login))
            $lastLogin = Carbon::parse($this->last_login)->diffForHumans();

        return $lastLogin;
    }

    public function getSlugAttribute()
    {
        return Str::slug($this->full_name) . '-' . $this->uniq_id;
    }

    public function getFirstNameAttribute($value)
    {
        $fullName = explode(' ', $this->full_name);

        return isset($fullName[0]) ? $fullName[0] : '';
    }

    public function getShowFullNameAttribute($value)
    {
        $fullName = $this->getTranslation('full_name', 'en');

        if (empty($fullName)) {
            $fullName = $this->getTranslation('full_name', 'ar');;
        }

        return $fullName;
    }

    public function getLastNameAttribute($value)
    {
        $fullName = explode(' ', $this->full_name);

        $lastName = isset($fullName[1]) ? $fullName[1] : '';

        if (isset($fullName[1]) && isset($fullName[2]))
            $lastName = $fullName[1] . ' ' . $fullName[2];

        return isset($lastName) ? $lastName : '';
    }

    public function scopeUserTypeAdmin($query)
    {
        return $query->where('user_type_id', UserType::ADMIN);
    }

    public function scopeActive($query)
    {
        return $query->where('status_id', UserStatus::ACCEPTED);
    }


    public function scopeUserTypeClient($query)
    {
        return $query->where('user_type_id', UserType::CLIENT);
    }

    public function scopeUserTypeVoiceActor($query)
    {
        return $query->where('user_type_id', UserType::VOICE_ACTOR);
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function status()
    {
        return $this->belongsTo(UserStatus::class, 'status_id');
    }

    public function authServiceProvider()
    {
        return $this->hasOne(AuthServiceProvider::class, 'user_id');
    }

    public function profile()
    {
        return $this->hasOne(UserProfile::class, 'user_id');
    }

//    public function workFields()
//    {
//        return $this->hasMany(UserWorkField::class, 'user_id');
//    }

    public function languages()
    {
        return $this->belongsToMany(Language::class, 'user_languages', 'user_id', 'language_id');
    }

    public function paymentMethods()
    {
        return $this->belongsToMany(PaymentMethod::class, 'user_payment_methods', 'user_id', 'payment_method_id');
    }

    public function workFields()
    {
        return $this->belongsToMany(WorkField::class, 'user_work_fields', 'user_id', 'work_field_id');
    }

    public function ordersCustomer()
    {
        return $this->hasMany(Order::class, 'customer_id');
    }


    public function pendingOrdersCustomer()
    {
        return $this->hasMany(Order::class, 'customer_id')->where('status_id', OrderStatus::PENDING);
    }

    public function inProgressOrdersCustomer()
    {
        return $this->hasMany(Order::class, 'customer_id')->where('status_id', OrderStatus::IN_PROGRESS);
    }

    public function completedOrdersCustomer()
    {
        return $this->hasMany(Order::class, 'customer_id')->where('status_id', OrderStatus::COMPLETED);
    }

}
