<?php


namespace App\Http\Controllers\AdminPanel\VoiceActor;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Controllers\AdminPanel\VoiceActorSample\VoiceActorSampleTrait;
use App\Http\Resources\AdminPanel\VoiceActor\VoiceActorResources;
use App\Models\User;
use App\Models\UserSample;
use Illuminate\Http\Request;

class VoiceActorDetailsController extends CoreController
{
    use VoiceActorSampleTrait;

    public function __construct(UserSample $sample)
    {
        $this->dirView = 'voice-actors';
        $this->asRoute = 'voiceActor';
        $this->route = 'voice-actors';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($sample);
    }

    public function index($voiceActorId)
    {
        $pageTitle = trans_admin('voice_over_details');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;
        $voiceActor = User::FindorFail($voiceActorId);

        /***
         *
         * الرئيسية فيها ملخص البروفايل
       الاسم ، البريد ، الصورة ، حالة الحساب ، رقم الجوال ، الدولة ،
         *
         * امكانية تعديل البروفايل ضمن تاب الاعدادات
         * امكانية تعديل كلمة المررو
         * امكانية ايضاح طريقة الدخول لو بحسابات السوشيل ميديا
         * تعطيل الحساب
         *
         *
         * تاب الحماية
         * عرض جدول السيشن
         *
         * المالية
         * الحركات المالية
         * المحفظة
         * حركات المحفظة كاملة
         *
         *
         * الطلبات كاملة حجز او شراء
         *
         *
         *
         *
         *
         *
         *
         */
        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.details.index',
            compact('pageTitle', 'asRoute','voiceActor')
        );
    }




}
