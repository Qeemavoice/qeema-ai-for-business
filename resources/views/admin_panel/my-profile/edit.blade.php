@extends('admin_panel.layouts.app')

@push('page-title')
    {{trans_admin('admins')}}
@endpush

@section('content')
    <div>
        @include('admin_panel.my-profile.includes.info-card')

        <div class="card mb-5 mb-xl-10">
            <div class="card-header border-0 cursor-pointer" role="button" data-bs-toggle="collapse" data-bs-target="#kt_account_signin_method">
                <div class="card-title m-0">
                    <h3 class="fw-bolder m-0">{{trans_admin('change_password')}}</h3>
                </div>
            </div>
            <div class="collapse show">
                <div class="card-body border-top p-9">
                    <div class="d-flex flex-wrap align-items-center mb-10">
                        <div id="kt_signin_password_edit" class="flex-row-fluid">
                            <change-password-form inline-template>
                                <form class="form fv-plugins-bootstrap5 fv-plugins-framework" novalidate="novalidate">
                                    <div class="row mb-1">
                                        <div class="col-lg-4">
                                            <div class="fv-row mb-0 fv-plugins-icon-container">
                                                <label for="currentpassword" class="form-label fs-6 fw-bolder mb-3">{{trans_admin('current_password')}} </label>
                                                <input type="password" v-model="current_password" class="form-control form-control-lg" name="currentpassword" id="currentpassword">
                                                <div class="fv-plugins-message-container invalid-feedback"  v-if="form.validation&&form.validation.current_password">@{{ form.validation.current_password[0] }}</div>
                                            </div>
                                        </div>
                                        <div class="col-lg-4">
                                            <div class="fv-row mb-0 fv-plugins-icon-container">
                                                <label for="newpassword" class="form-label fs-6 fw-bolder mb-3">{{trans_admin('new_password')}}</label>
                                                <input type="password" v-model="new_password" class="form-control form-control-lg" name="newpassword" id="newpassword">
                                                <div class="fv-plugins-message-container invalid-feedback"  v-if="form.validation&&form.validation.new_password">@{{ form.validation.new_password[0] }}</div>

                                            </div>
                                        </div>
                                        <div class="col-lg-4">
                                            <div class="fv-row mb-0 fv-plugins-icon-container">
                                                <label for="confirmpassword" class="form-label fs-6 fw-bolder mb-3">{{trans_admin('confirm_new_password')}}</label>
                                                <input type="password" v-model="confirm_new_password" class="form-control form-control-lg" name="confirmpassword" id="confirmpassword">
                                                <div class="fv-plugins-message-container invalid-feedback"  v-if="form.validation&&form.validation.confirm_new_password">@{{ form.validation.confirm_new_password[0] }}</div>

                                            </div>
                                        </div>
                                    </div>
                                    <div class="d-flex float-end mt-5">
                                        <button  @click="updatePassword" :disabled="form.disabledButton"  type="button" class="btn btn-primary me-2 px-6">{{trans_admin('update_password')}}</button>
                                    </div>
                                </form>
                            </change-password-form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
