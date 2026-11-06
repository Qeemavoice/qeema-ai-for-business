<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class PermissionGroup extends Model
{
    use HasTranslations;

    public $translatable = ['name'];

    public const DASHBOARD = 1;
    public const ORDERS = 2;
    public const TRANSACTIONS = 3;
    public const CLIENTS = 4;
    public const VOICE_ACTORS = 5;
    public const VOICE_ACTOR_SAMPLES = 6;
    public const MAIL_MESSAGES = 7;
    public const MAILING_LISTS = 8;
    public const CAREERS = 9;
    public const ARTICLES = 10;
    public const FAQS = 11;
    public const GUIDES = 12;
    public const PAGES = 13;
    public const VOICES = 14;
    public const COUPONS = 15;
    public const BANNERS = 16;
    public const SERVICES = 17;
    public const LANGUAGES = 18;
    public const DIALECTS = 19;
    public const CATEGORIES = 20;
    public const WORKS = 21;
    public const FORMS = 22;
    public const ADMINS = 23;
    public const ROLES = 24;
    public const PERMISSIONS = 25;
    public const APPEARANCE = 26;
    public const SETTINGS = 27;



}
