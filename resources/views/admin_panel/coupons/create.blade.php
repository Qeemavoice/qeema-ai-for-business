@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <coupon-form :coupon="{{ isset($coupon) ? $coupon : 'null'}}" inline-template>
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
                            {!! html_entity_decode(build_fields('name',trans_admin('name'))) !!}

                            <div class="mb-10 d-flex flex-wrap gap-5">
                                <div class="fv-row w-100 flex-md-root">
                                    <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                        <span class="required">{{trans_admin('code')}}</span>
                                    </label>
                                    <input type="text" v-model="code" class="form-control " placeholder="{{trans_admin('enter_code')}}"/>
                                    <span v-if="form.validation && form.validation.code" class="error-block">@{{ form.validation.code[0] }}</span>
                                </div>
                                <div class="fv-row w-100 flex-md-root">
                                    <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                        <span class="required">{{trans_admin('value')}} ( % )</span>
                                    </label>
                                    <input type="text" v-model="value" class="form-control" placeholder="{{trans_admin('enter_value')}}"/>
                                    <span v-if="form.validation && form.validation.value" class="error-block">@{{ form.validation.value[0] }}</span>
                                </div>
                            </div>

                            <div class="mb-10 d-flex flex-wrap gap-5">
                                <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                    <span class="required">{{trans_admin('minimum_minutes')}}</span>
                                </label>
                                <input type="number" v-model="minimum_minutes" class="form-control " placeholder="{{trans_admin('enter_minimum_minutes')}}"/>
                                <span v-if="form.validation && form.validation.code" class="error-block">@{{ form.validation.code[0] }}</span>
                            </div>

                            <div class="mb-10 d-flex flex-wrap gap-5">
                                <div class="fv-row w-100 flex-md-root">
                                    <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                        <span class="required">{{trans_admin('usage_limit_per_coupon')}}</span>
                                    </label>
                                    <input type="number" v-model="usage_limit_per_coupon" class="form-control " placeholder="{{trans_admin('enter_usage_limit_per_coupon')}}"/>
                                    <span v-if="form.validation && form.validation.usage_limit_per_coupon" class="error-block">@{{ form.validation.usage_limit_per_coupon[0] }}</span>
                                </div>
                                <div class="fv-row w-100 flex-md-root">
                                    <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                        <span class="required">{{trans_admin('usage_limit_per_customer')}}</span>
                                    </label>
                                    <input type="number" v-model="usage_limit_per_customer" class="form-control " placeholder="{{trans_admin('enter_usage_limit_per_customer')}}"/>
                                    <span v-if="form.validation && form.validation.usage_limit_per_customer" class="error-block">@{{ form.validation.usage_limit_per_customer[0] }}</span>
                                </div>
                            </div>

                            <div class="mb-10 col-md-12">
                                <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                    <span class="">{{trans_admin('is_active')}}</span>
                                </label>
                                <div class="form-check form-switch form-check-custom form-check-solid">
                                    <input type="checkbox" v-model="is_active" class="form-check-input">
                                </div>
                                <span v-if="form.validation && form.validation.is_active" class="error-block">@{{ form.validation.is_active[0] }}</span>
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
    </coupon-form>
@endsection

