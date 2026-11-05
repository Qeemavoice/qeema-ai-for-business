<admin-forgot-password-form inline-template>
    <div class="m-login__forget-password">
        <div class="m-login__head">
            <h3 class="m-login__title">{{ trans_admin('forgotten_password?') }}</h3>
            <div class="m-login__desc">{{ trans_admin('enter_your_email') }}</div>
        </div>
        <form class="m-login__form m-form" action="">
            <div class="form-group m-form__group">
                <input class="form-control m-input" type="text" placeholder="{{ trans_admin('email') }}" name="email" id="m_email" autocomplete="off">
            </div>
            <div class="m-login__form-action">
                <button id="m_login_forget_password_submit" class="btn btn-focus m-btn m-btn--pill m-btn--custom m-btn--air m-login__btn m-login__btn--primary">{{ trans_admin('request') }}</button>&nbsp;&nbsp;
                <button id="m_login_forget_password_cancel" class="btn btn-outline-focus m-btn m-btn--pill m-btn--custom  m-login__btn">{{ trans_admin('cancel') }}</button>
            </div>
        </form>
    </div>
</admin-forgot-password-form>
