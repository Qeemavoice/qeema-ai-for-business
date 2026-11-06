<login-by-services-form inline-template>
    <div id="modal_login_google" class="modal fade " role="dialog" style="z-index: 9999999;">
        <div class="modal-dialog">
            <div class="modal-content" v-loading="form.loadingDisplay">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">تسجيل الدخول</h5>
                    <button type="button" class="close" data-dismiss="modal" style="margin-left: 0;">&times;</button>
                </div>
                <div class="modal-body" id="modal_body_google">
                    <div class="wrapper" id="wizard">
                        <div class="form-area position-relative">
                            <div class="multisteps-form__panel js-active " data-id="1" data-animation="animate__bounce">
                                <div class="wizard-forms">
                                    <div class="inner pb-100 clearfix">
                                        <div class="form-content pera-content px-0 py-2">
                                            <div class="step-inner-content">
                                                <h2>سجل الدخول كعميل أو معلق صوتي</h2>
                                                <div class="step-box">
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <label class="step-box-content bg-white text-center relative-position active" id="login_google_{{\App\Models\UserType::CLIENT}}">
                                                                    <span class="step-box-icon">
                                                                        <img src="{{asset_app('img/d2.png')}}" style="width: 50%;" alt="" />
                                                                    </span>
                                                                <span class="step-box-text" style="font-size: 21px;">
                                                                    <span style="font-weight: 700; font-size: 24px;">{{trans_app('client')}}</span>
                                                                    (أود توظيف معلقين صوتين)
                                                                </span>
                                                                <span class="service-check-option">
                                                                    <span>
                                                                        <input type="radio" v-model="type" @change="eventSetType" value="{{\App\Models\UserType::CLIENT}}" class="service_name" />
                                                                    </span>
                                                                </span>
                                                            </label>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <label class="step-box-content bg-white text-center relative-position"  id="login_google_{{\App\Models\UserType::VOICE_ACTOR}}">
                                                                <span class="step-box-icon">
                                                                    <img src="{{asset_app('img/d1.png')}}" style="width: 50%;" alt="" />
                                                                </span>
                                                                <span class="step-box-text" style="font-size: 21px;">
                                                                    <span style="font-weight: 700;font-size: 24px;">معلق صوتي</span>(أبحث عن عمل)
                                                                </span>
                                                                <span class="service-check-option">
                                                                    <span><input type="radio" v-model="type" @change="eventSetType" value="{{\App\Models\UserType::VOICE_ACTOR}}" class="service_name"  /></span>
                                                                </span>
                                                            </label>
                                                        </div>
                                                        <div class="col-md-6"><span v-if="form.validation && form.validation.type" class="error-block">@{{ form.validation.type[0] }}</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="actions" style=" left: unset; position: unset;">
                                        <ul style="justify-content: center;">
                                            <li class="">
                                                <a href="javascript:;" @click="doLoginByGoogle(`{{route_auth('socialite.auth',['service' => 'google'])}}`)" :disabled="form.disabledButton">
                                                    <span class="register_google" style="width: 300px;">تسجيل دخول باستخدام جوجل<i class="fab fa-google me-2"></i></span>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</login-by-services-form>
