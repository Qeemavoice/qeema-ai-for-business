@extends('admin_panel.layouts.auth')

@push('page-title')
    {{trans_admin('sign_in')}}
@endpush

@section('content')
    <admin-login inline-template>

    <div class="d-flex flex-center flex-column flex-column-fluid">
        <div class="w-lg-500px p-10 p-lg-15 mx-auto">
            <form class="form w-100 fv-plugins-bootstrap5 fv-plugins-framework" @submit.prevent="login" novalidate="novalidate" id="kt_sign_in_form" action="#">
                <div class="text-center mb-10">
                    <h1 class="text-dark mb-3">{{trans_admin('sign_in_to_dashboard')}}</h1>
                </div>
                <div class="fv-row mb-10 fv-plugins-icon-container">
                    <label class="form-label fs-6 fw-bolder text-dark">{{trans_admin('email')}}</label>
                    <input class="form-control form-control-lg form-control-solid" v-model="email" type="text" name="email" autocomplete="off" placeholder="{{trans_admin('enter_your_email')}}">
                    <span class="form-control-feedback error-block" v-if="form.validation && form.validation.email">@{{ form.validation.email[0] }}</span>
                </div>

                <div class="fv-row mb-10 fv-plugins-icon-container">
                    <div class="d-flex flex-stack mb-2">
                        <label class="form-label fw-bolder text-dark fs-6 mb-0">{{trans_admin('password')}}</label>
                    </div>
                    <input class="form-control form-control-lg form-control-solid" v-model="password" type="password" name="password" autocomplete="off" placeholder="{{trans_admin('enter_your_password')}}">
                    <span class="form-control-feedback error-block" v-if="form.validation && form.validation.password">@{{ form.validation.password[0] }}</span>

                </div>

                <div class="text-center">
                    <button type="submit" id="kt_sign_in_submit" class="btn btn-lg btn-primary w-100 mb-5">
                        <span class="indicator-label">{{trans_admin('login')}}</span>
                        <span class="indicator-progress">Please wait...<span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    </admin-login>
@endsection

