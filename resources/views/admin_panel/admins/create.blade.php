@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <admin-form :admin="{{ isset($admin) ? $admin : 'null'}}"
                :user-image-default="`{{admin_image_default()}}`"
                inline-template>
        <form id="kt_ecommerce_add_product_form" class="form d-flex flex-column flex-lg-row" data-kt-redirect="">
            <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
                <div class="d-flex flex-column gap-7 gap-lg-10">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">
                                <h2>{{ $pageTitle }}</h2>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="mb-10 d-flex flex-wrap gap-5">
                                <div class="fv-row w-100 flex-md-root">
                                    <label class="form-label">{{ trans_admin('first_name') }}</label>
                                    <input type="text" v-model="first_name" class="form-control mb-2" />
                                    <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.first_name">@{{ form.validation.first_name[0] }}</div>
                                </div>
                                <div class="fv-row w-100 flex-md-root">
                                    <label class="form-label">{{ trans_admin('last_name') }}</label>
                                    <input type="text" v-model="last_name" class="form-control mb-2" />
                                    <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.last_name">@{{ form.validation.last_name[0] }}</div>
                                </div>
                            </div>
                            <div class="mb-10 d-flex flex-wrap gap-5" v-if="!id">
                                <div class="fv-row w-100 flex-md-root">
                                    <label class="form-label">{{ trans_admin('password') }}</label>
                                    <input type="password" v-model="password" class="form-control mb-2" />
                                    <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.password">@{{ form.validation.password[0] }}</div>
                                </div>
                                <div class="fv-row w-100 flex-md-root">
                                    <label class="form-label">{{ trans_admin('confirm_the_password') }}</label>
                                    <input type="password" v-model="password_confirmation" class="form-control mb-2" />
                                    <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.password_confirmation">@{{ form.validation.password_confirmation[0] }}</div>
                                </div>
                            </div>
                            <div class="mb-10 d-flex flex-wrap gap-5">
                                <div class="fv-row w-100 flex-md-root">
                                    <label class="form-label">{{ trans_admin('email') }}</label>
                                    <input type="email" v-model="email" class="form-control mb-2" />
                                    <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.email">@{{ form.validation.email[0] }}</div>
                                </div>
                                <div class="fv-row w-100 flex-md-root">
                                    <label class="form-label">{{ trans_admin('mobile') }}</label>
                                    <input type="number" v-model="mobile" class="form-control mb-2" />
                                    <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.mobile">@{{ form.validation.mobile[0] }}</div>
                                </div>
                            </div>
                            <div class="mb-10 d-flex flex-wrap gap-5">
                                <div class="fv-row w-100 flex-md-root">
                                    <label class="form-label">{{trans_admin('role')}}</label>
                                    <select v-model="role" class="form-control">
                                        <option value="" disabled>{{trans_admin('select_option')}}</option>
                                        <option v-for="(role,index) in roles" :value="role.id">@{{ role.name}}</option>
                                    </select>
                                    <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.role">@{{ form.validation.role[0] }}</div>
                                </div>
                                <div class="fv-row w-100 flex-md-root">
                                    <label class="form-label">{{ trans_admin('personal_photo') }}</label>
                                    <div style="margin-top: -15px;">
                                        <button @click="toggleShow()" type="button" class="btn btn-primary">
                                        <span class="svg-icon svg-icon-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path opacity="0.3" d="M10 4H21C21.6 4 22 4.4 22 5V7H10V4Z" fill="black"></path>
                                                <path d="M10.4 3.60001L12 6H21C21.6 6 22 6.4 22 7V19C22 19.6 21.6 20 21 20H3C2.4 20 2 19.6 2 19V4C2 3.4 2.4 3 3 3H9.20001C9.70001 3 10.2 3.20001 10.4 3.60001ZM16 11.6L12.7 8.29999C12.3 7.89999 11.7 7.89999 11.3 8.29999L8 11.6H11V17C11 17.6 11.4 18 12 18C12.6 18 13 17.6 13 17V11.6H16Z" fill="black"></path>
                                                <path opacity="0.3" d="M11 11.6V17C11 17.6 11.4 18 12 18C12.6 18 13 17.6 13 17V11.6H11Z" fill="black"></path>
                                            </svg>
                                        </span>
                                            {{ trans_admin('upload') }}
                                        </button>
                                        <my-upload field="img"
                                                   @crop-success="cropSuccess"
                                                   @crop-upload-success="cropUploadSuccess"
                                                   @crop-upload-fail="cropUploadFail"
                                                   v-model="show_image_crop_upload"
                                                   :width="70"
                                                   :height="70"
                                                   :url="'/uploads/uploadFileOnCrop/{{$DIR_FILE_UPLOADS}}'"
                                                   :headers="headers"
                                                   :lang-type="$lang"
                                                   :no-square="true">
                                        </my-upload>
                                        <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation && form.validation.personal_photo">@{{ form.validation.personal_photo[0] }}</div>
                                        <img v-if="imgDataUrl" :src="imgDataUrl" class="w-70px me-1 cursor-pointer symbol symbol-30px symbol-md-40px" style="margin-left: 5%;">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-end">
                    @include('admin_panel.includes.buttons.cancel')
                    @include('admin_panel.includes.buttons.save')
                </div>
            </div>
        </form>
    </admin-form>
@endsection


