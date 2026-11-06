<div class="tab-pane fade" id="paypal" role="tabpanel">
    <div class="card">
        <div class="card-body p-9">
            <form @submit.prevent="save">
                <div class="mb-10 col-md-12">
                    <label class="form-check form-switch form-check-custom form-check-solid">
                        <input v-model="paypal.is_active" class="form-check-input" type="checkbox" checked="checked">
                        <span class="form-check-label fw-bold text-muted">Active</span>
                    </label>
                </div>
                {!! html_entity_decode(build_fields('paypal.name',trans_admin('label'))) !!}
{{--                {!! html_entity_decode(build_fields('paypal.description',trans_admin('description'),null,'textarea')) !!}--}}
                <div class="mb-10 col-md-12">
                    <label class="form-label">Client ID</label>
                    <input v-model="paypal.config.client_id" class="form-control" type="text"  >
                    <span v-if="form.validation && form.validation['paypal.config.client_id']" class="error-block">@{{ form.validation['paypal.config.client_id'][0] }}</span>
                </div>
                <div class="mb-10 col-md-12">
                    <label class="form-label">Secret</label>
                    <input v-model="paypal.config.secret" class="form-control" type="text">
                    <span v-if="form.validation && form.validation['paypal.config.secret']" class="error-block">@{{ form.validation['paypal.config.secret'][0] }}</span>
                </div>

                <div class="mb-10 col-md-12">
                    <label class="form-check form-switch form-check-custom form-check-solid">
                        <input v-model="paypal.sandbox_is_active" class="form-check-input" type="checkbox" checked="checked">
                        <span class="form-check-label fw-bold text-muted">Sandbox</span>
                    </label>
                </div>
                <template v-if="paypal.sandbox_is_active">
                    <div class="mb-10 col-md-12">
                        <label class="form-label">Sandbox client ID</label>
                        <input v-model="paypal.sandbox_config.client_id" class="form-control" type="text"  >
                        <span v-if="form.validation && form.validation['paypal.sandbox_config.client_id']" class="error-block">@{{ form.validation['stripe.sandbox_config.client_id'][0] }}</span>
                    </div>
                    <div class="mb-10 col-md-12">
                        <label class="form-label">Sandbox secret</label>
                        <input v-model="paypal.sandbox_config.secret" class="form-control" type="text">
                        <span v-if="form.validation && form.validation['paypal.sandbox_config.secret']" class="error-block">@{{ form.validation['stripe.sandbox_config.secret'][0] }}</span>
                    </div>
                </template>

                <div class="card-footer d-flex justify-content-end py-6 px-9">
                    <button type="submit" class="btn btn-primary" :disabled="form.disabledButton">{{trans_admin('save')}}</button>
                </div>
            </form>
        </div>
    </div>
</div>

{{--<label class="m-checkbox pb-4">--}}
{{--    <input type="checkbox" v-model="paypal.is_active"> Active--}}
{{--    <span></span>--}}
{{--</label>--}}
{{--{!! build_fields('paypal.name',trans_admin('label')) !!}--}}

{{--{!! build_fields('paypal.description',trans_admin('description'),null,'textarea') !!}--}}

{{--<div class="form-group pb-4">--}}
{{--    <label for="from_address">Client ID</label>--}}
{{--    <input type="email" v-model="paypal.config.client_id" class="form-control m-input m-input--square" id="from_address" aria-describedby="emailHelp" placeholder="Enter ">--}}
{{--    <span class="form-control-feedback error-block" v-if="form.validation&&form.validation['paypal.config.client_id']">@{{ form.validation['paypal.config.client_id'][0] }}</span>--}}
{{--</div>--}}
{{--<div class="form-group pb-4">--}}
{{--    <label for="from_address">Secret</label>--}}
{{--    <input type="email" v-model="paypal.config.secret" class="form-control m-input m-input--square" id="from_address" aria-describedby="emailHelp" placeholder="Enter ">--}}
{{--    <span class="form-control-feedback error-block" v-if="form.validation&&form.validation['paypal.config.secret']">@{{ form.validation['paypal.config.secret'][0] }}</span>--}}
{{--</div>--}}
{{--<label class="m-checkbox pb-4">--}}
{{--    <input type="checkbox" v-model="paypal.sandbox_is_active"> Sandbox--}}
{{--    <span></span>--}}
{{--</label>--}}
{{--<template v-if="paypal.sandbox_is_active">--}}
{{--    <div class="form-group pb-4">--}}
{{--        <label for="from_address">Sandbox Client ID</label>--}}
{{--        <input type="email" v-model="paypal.sandbox_config.client_id" class="form-control m-input m-input--square" id="from_address" aria-describedby="emailHelp" placeholder="Enter ">--}}
{{--        <span class="form-control-feedback error-block" v-if="form.validation&&form.validation['paypal.sandbox_config.client_id']">@{{ form.validation['paypal.sandbox_config.client_id'][0] }}</span>--}}
{{--    </div>--}}
{{--    <div class="form-group ">--}}
{{--        <label for="from_address">Sandbox Secret</label>--}}
{{--        <input type="email" v-model="paypal.sandbox_config.secret" class="form-control m-input m-input--square" id="from_address" aria-describedby="emailHelp" placeholder="Enter ">--}}
{{--        <span class="form-control-feedback error-block" v-if="form.validation&&form.validation['paypal.sandbox_config.secret']">@{{ form.validation['paypal.sandbox_config.secret'][0] }}</span>--}}
{{--    </div>--}}
{{--</template>--}}
