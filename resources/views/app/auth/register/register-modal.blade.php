<register-form inline-template>
    <div ref="modal_register_form" id="modal_registration" class="modal fade " role="dialog" style="z-index: 9999999;">
        <div class="modal-dialog">
            <div class="modal-content" v-loading="form.loadingDisplay">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">{{trans_app('register')}}</h5>
                    <button type="button" class="close" data-dismiss="modal" style="margin-left: 0px;">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="wrapper">
                        <div class="steps-area position-relative d-none">
                            <div class="steps clearfix">
                                <ul class="tablist multisteps-form__progress">
                                    <li class="multisteps-form__progress-btn first done checked js-active current" aria-selected="false"><span>1</span></li>
                                    <li class="multisteps-form__progress-btn"><span>2</span></li>
                                    <li class="multisteps-form__progress-btn"><span>3</span></li>
                                    <li class="multisteps-form__progress-btn"><span>4</span></li>
                                    <li class="multisteps-form__progress-btn last"><span>5</span></li>
                                </ul>
                            </div>
                        </div>
                        <form class="multisteps-form__form" action="#" id="wizard" novalidate="novalidate" style="height: auto !important;">
                            <div class="form-area position-relative">
                                @include('app.auth.register.includes.step-1')
                                @include('app.auth.register.includes.step-2')
                                @include('app.auth.register.includes.step-3')
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</register-form>


{{--<div id="modal_registration_google" class="modal fade " role="dialog" style="z-index: 9999999;">--}}
{{--    <div class="modal-dialog">--}}
{{--        <!-- Modal content-->--}}
{{--        <div class="modal-content">--}}
{{--            <!--style="height: 500px;"-->--}}
{{--            <div class="modal-header">--}}
{{--                <h5 class="modal-title" id="exampleModalLabel"></h5>--}}
{{--                <button type="button" class="close" data-dismiss="modal" style="margin-left: 0px;">&times;</button>--}}
{{--            </div>--}}
{{--            <div class="modal-body" id="modal_body_google">--}}
{{--                <div class="wrapper" id="wizard">--}}
{{--                    <div class="form-area position-relative">--}}
{{--                        <div class="multisteps-form__panel js-active " data-id="1" data-animation="animate__bounce">--}}
{{--                            <div class="wizard-forms">--}}
{{--                                <div class="inner pb-100 clearfix">--}}
{{--                                    <div class="form-content pera-content px-0 py-2">--}}
{{--                                        <div class="step-inner-content">--}}
{{--                                            <h2>سجل الدخول كعميل أو معلق صوتي</h2>--}}
{{--                                            <div class="step-box">--}}
{{--                                                <div class="row">--}}
{{--                                                    <div class="col-md-6">--}}
{{--                                                        <label class="step-box-content bg-white text-center relative-position active"--}}
{{--                                                               data-id="1">--}}
{{--                                                                    <span class="step-box-icon">--}}
{{--                                                                        <img src="/frontend/assets/img/d2.png"--}}
{{--                                                                             style="width: 50%;" alt=""/>--}}
{{--                                                                    </span>--}}
{{--                                                            <span class="step-box-text" style="font-size: 21px;">--}}
{{--                                                                         <span style="font-weight: 700; font-size: 24px;">--}}
{{--                                                                              عميل--}}
{{--                                                                         </span>--}}
{{--                                                                          (أود توظيف معلقين صوتين)--}}
{{--                                                                    </span>--}}
{{--                                                            <span class="service-check-option">--}}
{{--                                                                        <span><input type="radio" name="service_name"--}}
{{--                                                                                     class="service_name"--}}
{{--                                                                                     value="Corporate Services"/></span>--}}
{{--                                                                    </span>--}}
{{--                                                        </label>--}}
{{--                                                    </div>--}}
{{--                                                    <div class="col-md-6">--}}
{{--                                                        <label class="step-box-content bg-white text-center relative-position "--}}
{{--                                                               data-id="2">--}}
{{--                                                                    <span class="step-box-icon">--}}
{{--                                                                        <img src="/frontend/assets/img/d1.png"--}}
{{--                                                                             style="width: 50%;" alt=""/>--}}
{{--                                                                    </span>--}}
{{--                                                            <span class="step-box-text" style="font-size: 21px;">--}}
{{--                                                                         <span style="font-weight: 700;font-size: 24px;">--}}
{{--                                                                         معلق صوتي--}}

{{--                                                                         </span>--}}

{{--                                                                          (أبحث عن عمل)--}}
{{--                                                                    </span>--}}
{{--                                                            <span class="service-check-option">--}}
{{--                                                                        <span><input type="radio" name="service_name"--}}
{{--                                                                                     class="service_name"--}}
{{--                                                                                     value="Freelancing Services"/></span>--}}
{{--                                                                    </span>--}}
{{--                                                        </label>--}}
{{--                                                    </div>--}}

{{--                                                </div>--}}
{{--                                            </div>--}}
{{--                                        </div>--}}
{{--                                    </div>--}}
{{--                                </div>--}}
{{--                                <div class="actions" style=" left: unset; position: unset;">--}}
{{--                                    <ul style="justify-content: center;">--}}
{{--                                        <input type="hidden" name="type" class="type required" id="type" value="1"--}}
{{--                                               required/>--}}

{{--                                        <li class="">--}}
{{--                                                    <span class=" register_google" style="width: 300px;">--}}
{{--                                                        تسجيل دخول باستخدام جوجل--}}
{{--                                                        <i class="fab fa-google me-2"></i>--}}
{{--                                                    </span>--}}
{{--                                        </li>--}}

{{--                                    </ul>--}}
{{--                                </div>--}}
{{--                            </div>--}}
{{--                        </div>--}}
{{--                    </div>--}}
{{--                </div>--}}
{{--            </div>--}}
{{--        </div>--}}
{{--    </div>--}}
{{--</div>--}}
