<reset-password-form
    :token="`{{ request()->has('forgetPasswordToken') ? request('forgetPasswordToken') : null }}`"
    inline-template>
    <div id="modal_rest_password" ref="modalResetPasswordForm" class="modal fade" role="dialog" style="z-index: 9999999;">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">تغيير كلمة المرور</h5>
                    <button type="button" class="close" data-dismiss="modal" style="margin-left: 0px;">&times;</button>
                </div>
                <div class="modal-body" v-loading="form.loadingDisplay">
                    <form role="form" action="" method="post" class="form_login">
                        <div class="price total-price">
                            <div class="row justify-content-center">
                                <p> تغيير كلمة المرور</p>
                            </div>
                            <div class="row justify-content-center">
                                <div class="col-md-12 col-lg-12 mb-3">
                                    <label for="login_mail">كلمة المرور الجديدة</label>
                                    <input type="password" v-model="password" class="form-control password" placeholder="كلمة المرور الجديدة">
                                    <span class="error-block" v-if="form.validation&&form.validation.password">@{{ form.validation.password[0] }}</span>
                                </div>
                                <div class="col-md-12 col-lg-12 mb-3">
                                    <label for="login_mail">تأكيد كلمة المرور </label>
                                    <input type="password" v-model="password_confirmation" class="form-control password" placeholder="تأكيد كلمة المرور">
                                     <span class="error-block" v-if="form.validation&&form.validation.password_confirmation">@{{ form.validation.password_confirmation[0] }}</span>
                                </div>
                                <div class="col-md-6 col-lg-6 mb-3">
                                    <a href="javascript:;" @click="send" :disabled="form.disabledButton" style="display: block; background: #FEA107 !important; color: #fff !important; border: none !important;" class="btn bg-login text-light px-0 w-100 py-3">تغيير كلمة المرور<i class="fa fa-spinner fa-spin"></i></a>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</reset-password-form>
