<div class="tab-pane fade active show" id="stripe" role="tabpanel">
    <div class="card">
        <div class="card-body p-9">
            <form @submit.prevent="save">
                <div class="mb-10 col-md-12">
                    <label class="form-check form-switch form-check-custom form-check-solid">
                        <input v-model="stripe.is_active" class="form-check-input" type="checkbox" checked="checked">
                        <span class="form-check-label fw-bold">{{trans_admin('active_service')}}</span>
                    </label>
                </div>
                {!! html_entity_decode(build_fields('stripe.name',trans_admin('label'))) !!}
{{--                {!! html_entity_decode(build_fields('stripe.description',trans_admin('description'),null,'textarea')) !!}--}}
                <div class="mb-10 col-md-12">
                    <label class="form-label">{{trans_admin('live_mode_key_id')}}</label>
                    <input v-model="stripe.config.key_id" class="form-control" type="text"  >
                    <span v-if="form.validation && form.validation['stripe.config.key_id']" class="error-block">@{{ form.validation['stripe.config.key_id'][0] }}</span>
                </div>
                <div class="mb-10 col-md-12">
                    <label class="form-label">{{trans_admin('live_mode_secret_key')}}</label>
                    <input v-model="stripe.config.secret" class="form-control" type="text">
                    <span v-if="form.validation && form.validation['stripe.config.secret']" class="error-block">@{{ form.validation['stripe.config.secret'][0] }}</span>
                </div>

                <div class="mb-10 col-md-12">
                    <label class="form-check form-switch form-check-custom form-check-solid">
                        <input v-model="stripe.sandbox_is_active" class="form-check-input" type="checkbox" checked="checked">
                        <span class="form-check-label fw-bold ">{{trans_admin('test_mode')}}</span>
                    </label>
                </div>
                <template v-if="stripe.sandbox_is_active">
                    <div class="mb-10 col-md-12">
                        <label class="form-label">{{trans_admin('test_mode_key_id')}}</label>
                        <input v-model="stripe.sandbox_config.key_id" class="form-control" type="text"  >
                        <span v-if="form.validation && form.validation['stripe.sandbox_config.key_id']" class="error-block">@{{ form.validation['stripe.sandbox_config.key_id'][0] }}</span>
                    </div>
                    <div class="mb-10 col-md-12">
                        <label class="form-label">{{trans_admin('test_mode_secret_key')}} </label>
                        <input v-model="stripe.sandbox_config.secret" class="form-control" type="text">
                        <span v-if="form.validation && form.validation['stripe.sandbox_config.secret']" class="error-block">@{{ form.validation['stripe.sandbox_config.secret'][0] }}</span>
                    </div>
                </template>
                <div class="card-footer d-flex justify-content-end py-6 px-1">
                    <button type="submit" class="btn btn-primary" :disabled="form.disabledButton">{{trans_admin('save')}}</button>
                </div>
            </form>
        </div>
    </div>
</div>


{{--<div class="form-group m-form__group">--}}
{{--    <label for="from_address">Key ID</label>--}}
{{--    <input type="email" v-model="stripe.config.key_id" class="form-control m-input m-input--square" id="from_address" aria-describedby="emailHelp" placeholder="Enter ">--}}
{{--    <span class="form-control-feedback error-block" v-if="form.validation&&form.validation['stripe.config.key_id']">@{{ form.validation['stripe.config.key_id'][0] }}</span>--}}
{{--</div>--}}

{{--<div class="form-group m-form__group">--}}
{{--    <label for="from_address">Secret</label>--}}
{{--    <input type="email" v-model="stripe.config.secret" class="form-control m-input m-input--square" id="from_address" aria-describedby="emailHelp" placeholder="Enter ">--}}
{{--    <span class="form-control-feedback error-block" v-if="form.validation&&form.validation['stripe.config.secret']">@{{ form.validation['stripe.config.secret'][0] }}</span>--}}
{{--</div>--}}
{{--<label class="m-checkbox pb-4">--}}
{{--    <input type="checkbox" v-model="stripe.sandbox_is_active"> Sandbox--}}
{{--    <span></span>--}}
{{--</label>--}}
{{--<template v-if="stripe.sandbox_is_active">--}}
{{--    <div class="form-group pb-4">--}}
{{--        <label for="from_address">Sandbox Key ID</label>--}}
{{--        <input type="email" v-model="stripe.sandbox_config.key_id" class="form-control m-input m-input--square" id="from_address" aria-describedby="emailHelp" placeholder="Enter ">--}}
{{--        <span class="form-control-feedback error-block" v-if="form.validation&&form.validation['stripe.sandbox_config.key_id']">@{{ form.validation['stripe.sandbox_config.key_id'][0] }}</span>--}}
{{--    </div>--}}
{{--    <div class="form-group ">--}}
{{--        <label for="from_address">Sandbox Secret</label>--}}
{{--        <input type="email" v-model="stripe.sandbox_config.secret" class="form-control m-input m-input--square" id="from_address" aria-describedby="emailHelp" placeholder="Enter ">--}}
{{--        <span class="form-control-feedback error-block" v-if="form.validation&&form.validation['stripe.sandbox_config.secret']">@{{ form.validation['stripe.sandbox_config.secret'][0] }}</span>--}}
{{--    </div>--}}
{{--</template>--}}
