
@extends('admin_panel.layouts.app')

@push('page-title')
    {{ meta('breadcrumbs-title') }}
@endpush

@section('content')
    <setting-commissions-form :page="'{{$page}}'" :settings="{{ isset($settings) ? json_encode($settings) : 'null' }}" inline-template>
        <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
            <div class="d-flex flex-column gap-7 gap-lg-10">
                <div class="card">
                    <div class="card-header cursor-pointer">
                        <div class="card-title">
                            <h2>{{ meta('breadcrumbs-title') }}</h2>
                            <div class="separator"></div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="fv-row w-100 flex-md-root">
                            <h3 class="mb-6">{{trans_admin('fees') }} <span style="color:#ffa714">{{app_name()}}</span></h3>
                            <div class="row">
                                <div class="col-md-6">
                                    <label for="fee_app" class="form-label mb-2">رسوم المنصة <code>(%)</code></label>
                                    <input type="number" v-model="commissions.platform" class="form-control" id="fee_app" placeholder=" ">
                                    <span class="form-control-feedback error-block" v-if="form.validation && form.validation.commissions.platform">@{{ form.validation.commissions.platform[0] }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="fv-row w-100 flex-md-root mt-6">
                            <h3 class="mb-6">{{trans_admin('fees_payment_methods') }} </h3>

                            <div class="row">
                                <div class="col-md-6">
                                    <label for="fee_stripe" class="form-label mb-2">رسوم سترايب<code>(%)</code></label>
                                    <input type="number" v-model="commissions.stripe" class="form-control" id="fee_stripe" placeholder=" ">
                                    <span class="form-control-feedback error-block" v-if="form.validation && form.validation.commissions.stripe">@{{ form.validation.commissions.platform[0] }}</span>
                                </div>
{{--                                <div class="col-md-6">--}}
{{--                                    <label for="fee_paypal" class="form-label mb-2">رسوم بايبال<code>(%)</code></label>--}}
{{--                                    <input type="number" v-model="commissions.paypal" class="form-control" id="fee_paypal" placeholder=" ">--}}
{{--                                    <span class="form-control-feedback error-block" v-if="form.validation && form.validation.commissions.paypal">@{{ form.validation.commissions.platform[0] }}</span>--}}
{{--                                </div>--}}
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
    </setting-commissions-form>
@endsection



