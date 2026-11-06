<coupon-form
        :coupon.sync="coupon"
        inline-template>
    <div class="modal fade" id="modal_add_coupon" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">@{{ modal_title }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        {!! html_entity_decode(build_fields('name',trans_admin('name'))) !!}
                        <div class="mb-10 col-md-6">
                            <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                <span class="required">{{trans_admin('code')}}</span>
                            </label>
                            <input type="text" v-model="code" class="form-control form-control-solid" placeholder="{{trans_admin('enter_code')}}"/>
                            <span v-if="form.validation && form.validation.code" class="error-block">@{{ form.validation.code[0] }}</span>
                        </div>
                        <div class="mb-10 col-md-6">
                            <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                <span class="required">{{trans_admin('value')}} ( % )</span>
                            </label>
                            <input type="text" v-model="value" class="form-control form-control-solid" placeholder="{{trans_admin('enter_value')}}"/>
                            <span v-if="form.validation && form.validation.value" class="error-block">@{{ form.validation.value[0] }}</span>
                        </div>
                        <div class="mb-10 col-md-6">
                            <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                <span class="required">{{trans_admin('usage_limit_per_coupon')}}</span>
                            </label>
                            <input type="number" v-model="usage_limit_per_coupon" class="form-control form-control-solid" placeholder="{{trans_admin('enter_usage_limit_per_coupon')}}"/>
                            <span v-if="form.validation && form.validation.usage_limit_per_coupon" class="error-block">@{{ form.validation.usage_limit_per_coupon[0] }}</span>
                        </div>
                        <div class="mb-10 col-md-6">
                            <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                <span class="required">{{trans_admin('usage_limit_per_customer')}}</span>
                            </label>
                            <input type="number" v-model="usage_limit_per_customer" class="form-control form-control-solid" placeholder="{{trans_admin('enter_usage_limit_per_customer')}}"/>
                            <span v-if="form.validation && form.validation.usage_limit_per_customer" class="error-block">@{{ form.validation.usage_limit_per_customer[0] }}</span>
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
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" @click="save" :disabled="form.disabledButton">{{trans_admin('save')}}</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{trans_admin('close')}}</button>
                </div>
            </div>
        </div>
    </div>
</coupon-form>
