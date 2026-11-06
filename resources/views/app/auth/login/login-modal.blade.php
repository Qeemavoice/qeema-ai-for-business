<login-form inline-template>
    <div id="modal_login" ref="modalLoginForm" class="modal fade" role="dialog" style="z-index: 9999999;">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">سجل معنا</h5>
                    <button type="button" class="close" data-dismiss="modal" style="margin-left: 0px;">&times;</button>
                </div>
                <div class="modal-body" v-loading="form.loadingDisplay">
                    <form role="form" action="" method="post" class="form_login" id="">
                        <div class="price total-price">
                            <div class="row justify-content-center"><p> تسجيل الدخول</p></div>
                            <div class="row justify-content-center">
                                <div class="col-md-12 col-lg-12 mb-3">
                                    <label for="login_mail">البريد الالكتروني</label>
                                    <input type="email" v-model="email" id="login_mail" class="form-control email" placeholder="البريد الالكتروني">
                                    <span v-if="form.validation && form.validation.email" class="error-block">@{{ form.validation.email[0] }}</span>
                                </div>
                                <div class="col-md-12 col-lg-12 mb-3">
                                    <label for="login_password">كلمة المرور </label>
                                    <input type="password" v-model="password" id="login_password" class="form-control password" placeholder="كلمة المرور ">
                                    <span v-if="form.validation && form.validation.password" class="error-block">@{{ form.validation.password[0] }}</span>
                                </div>
                                <div class="col-md-12 col-lg-12 mb-3">
                                    <a href="javaScript:;" @click="showForgetPasswordForm" class="show_registration"> هل نسيت كلمة المرور ؟</a>
                                </div>
                                <div class="col-md-6 col-lg-6 mb-3">
                                    <a href="javascript:;" @click="doLogin" :disabled="form.disabledButton" style="display: block; background: #FEA107 !important; color: #fff !important; border: none !important;" class="btn bg-login text-light px-0 w-100 py-3">تسجيل الدخول<i class="fa fa-spinner fa-spin"></i></a>
                                </div>
                                <div class="col-lg-6 mb-3">
                                    <a href="javascript:;" @click="showLoginGoogleModal" style="display: block; background: #FEA107 !important; color: #fff !important; border: none !important;" class="show_google_model btn bg-google text-light w-100 px-0 py-3"><i class="fab fa-google me-2"></i> تسجيل دخول باستخدام جوجل </a>
                                </div>

                                <div class="col-lg-12 text-center">
                                    <h5> ليس لديك حساب؟
                                        <a href="javaScript:;" @click="showRegisterForm" style="color: #FEA107;font-weight: 600;" class="show_registration">إنشاء حساب</a>
                                    </h5>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</login-form>
