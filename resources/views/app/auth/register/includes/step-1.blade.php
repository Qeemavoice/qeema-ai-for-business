<!-- div 1 -->
<div class="multisteps-form__panel js-active " id="step_1" data-animation="animate__bounce">
    <div class="wizard-forms">
        <div class="inner pb-100 clearfix">
            <div class="form-content pera-content py-3">
                <div class="step-inner-content">
                    <h2> انضم إلينا كعميل أو معلق صوتي </h2>
                    <div class="step-box">
                        <div class="row">
                            <div class="col-md-6">
                                <label class="step-box-content bg-white text-center relative-position" id="type_{{\App\Models\UserType::CLIENT}}">
                                    <span class="step-box-icon"><img src="{{asset_app('img/d2.png')}}" style="width: 50%;" alt=""/></span>
                                    <span class="step-box-text" style="font-size: 21px;">
                                        <span style="font-weight: 700; font-size: 24px;">{{trans_app('client')}}</span>
                                        (أود توظيف معلقين صوتين)
                                    </span>
                                    <span class="service-check-option">
                                        <span><input type="radio" v-model="type" @change="eventSetType" class="service_name" value="{{\App\Models\UserType::CLIENT}}"/></span>
                                    </span>
                                </label>
                            </div>
                            <div class="col-md-6">
                                <label class="step-box-content bg-white text-center relative-position " id="type_{{\App\Models\UserType::VOICE_ACTOR}}">
                                    <span class="step-box-icon"><img src="{{asset_app('img/d1.png')}}" style="width: 50%;" alt=""/></span>
                                    <span class="step-box-text" style="font-size: 21px;"><span style="font-weight: 700;font-size: 24px;">معلق صوتي</span>(أبحث عن عمل)</span>
                                    <span class="service-check-option">
                                        <span><input type="radio" v-model="type" @change="eventSetType" value="{{\App\Models\UserType::VOICE_ACTOR}}" class="service_name" /></span>
                                    </span>
                                </label>
                            </div>
                            <div class="col-md-6"><span v-if="form.validation && form.validation.type" class="error-block">@{{ form.validation.type[0] }}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="actions mt-3" style=" left: unset; position: unset;">
            <ul style="margin: 0 auto;justify-content: center;">
                <li><a href="javascript:;" @click="createAccountButton" title=" إنشاء حساب "> <span class="js-btn-next"> إنشاء حساب  <i class="fa fa-arrow-left"></i></span></a></li>
                <li><a href="{{route_auth('socialite.auth',['service' => 'google'])}}"><span class=" register_google" style="width: 300px;">إنشاء حساب  باستخدام جوجل<i class="fab fa-google me-2"></i></span></a></li>
            </ul>
        </div>
        <!--<div class="text-center mt-3" >-->
        <!--    <a href="http://qeemavoice.test/register/google" style="display: block; background: #FEA107 !important; color: #fff !important; border: none !important;" -->
        <!--    class="show_google_model btn bg-google text-light py-3"></a>-->
        <!--</div>-->
        <div class="text-center mt-3">
            <h5> لديك حساب؟
                <a href="javaScript:;" @click="showLoginForm" style="color: #FEA107;font-weight: 600;" class="show_login">سجل الدخول</a>
            </h5>
        </div>
    </div>
</div>
