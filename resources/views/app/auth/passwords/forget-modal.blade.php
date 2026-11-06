<forget-password-form inline-template>
    <div id="modal_forget_password" ref="modalForgetPasswordForm" class="modal fade" role="dialog" style="z-index: 9999999;">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">نسيت كلمة المرور ؟</h5>
                    <button type="button" class="close" data-dismiss="modal" style="margin-left: 0px;">&times;</button>
                </div>
                <div class="modal-body" v-loading="form.loadingDisplay">
                    <form role="form" action="" method="post" class="form_login" id="">
                        <div class="price total-price">
                            <div class="row justify-content-center">
                                <div class="col-md-12 col-lg-12 mb-3">
                                    <label for="login_mail">البريد الالكتروني</label>
                                    <input type="email" v-model="email" id="forget_password_email" class="form-control email" placeholder="البريد الالكتروني">
                                    <span v-if="form.validation && form.validation.email" class="error-block">@{{ form.validation.email[0] }}</span>
                                </div>
                                <div class="col-md-6 col-lg-6 mb-3">
                                    <a href="javascript:;" @click="send" :disabled="form.disabledButton" style="display: block; background: #FEA107 !important; color: #fff !important; border: none !important;" class="btn bg-login text-light px-0 w-100 py-3">نسيت كلمة المرور<i class="fa fa-spinner fa-spin"></i></a>
                                </div>
                                <div class="col-lg-12 text-center">
                                    <h5>تذكرت كلمة المرور ؟
                                        <a href="javaScript:;" @click="showLoginForm" style="color: #FEA107;font-weight: 600;" class="show_registration">تسجيل الدخول</a>
                                    </h5>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</forget-password-form>
