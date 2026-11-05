@extends('admin_panel.layouts.auth')

@push('page-title')
    {{ trans_admin('reset_password') }}
@endpush

@section('content')
    <admin-restore-password-form :token="`{{ request()->has('token') ? request('token') : null }}`"
                                 inline-template>
        <div class="m-grid m-grid--hor m-grid--root m-page">
            <div class="m-grid__item m-grid__item--fluid m-grid m-grid--hor m-login m-login--signin m-login--2 m-login-2--skin-2" id="m_login" style="background-image: url({{ asset_admin('assets/app/media/img//bg/bg-3.jpg') }});">
                <div class="m-grid__item m-grid__item--fluid	m-login__wrapper">
                    <div class="m-login__container">
                        <div class="m-login__logo">
                            <a href="#">
                                <img src="">
                            </a>
                        </div>
                        <div class="m-login__signin">
                            <div class="m-login__head">
                                <h3 class="m-login__title">{{ trans_admin('restore_password') }}</h3>
                                <div class="m-login__desc">{{ trans_admin('enter_the_new_password') }}</div>
                            </div>
                            <form class="m-login__form m-form" method="POST" action="{{ route_admin('password.do_reset') }}">
                                @csrf
                                <div class="form-group m-form__group">
                                    <input v-model="new_password" class="form-control m-input {{ $errors->has('password') ? ' is-invalid' : '' }}" type="password" placeholder="{{ trans_admin('password') }}" name="password" value="" autocomplete="off">
                                    @if ($errors->has('password'))
                                        <div class="error-block">{{ $errors->first('password') }}</div>
                                    @endif
                                    <span v-if="form.validation && form.validation.password" class="error-block">@{{ form.validation.password[0] }}</span>
                                </div>

                                <div class="form-group m-form__group">
                                    <input v-model="confirm_new_password" class="form-control m-input {{ $errors->has('password_confirmation') ? ' is-invalid' : '' }}" type="password" placeholder="{{ trans_admin('confirm_password') }}" name="password_confirmation" value="" autocomplete="off">
                                    @if ($errors->has('password_confirmation'))
                                        <div class="error-block">{{ $errors->first('password_confirmation') }}</div>
                                    @endif
                                    <span v-if="form.validation && form.validation.password_confirmation" class="error-block">@{{ form.validation.password_confirmation[0] }}</span>
                                </div>
                                <div class="row m-login__form-sub">
                                    <div class="col m--align-right m-login__form-right">
                                        <a href="{{ route_admin('login') }}" class="m-link">{{ trans_admin('login?') }}</a>
                                    </div>
                                </div>

                                <div class="m-login__form-action">
                                    <button type="button" @click="restorePassword" :disabled="form.disabledButton" class="btn btn-focus m-btn m-btn--pill m-btn--custom m-btn--air  m-login__btn m-login__btn--primaryr">
                                        <i class="fa fa-spinner fa-pulse fa-1x fa-fw" v-if="form.loadingDisplay"></i>
                                        {{ trans_admin('restore_password') }}
                                    </button>&nbsp;&nbsp;
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </admin-restore-password-form>
@endsection
