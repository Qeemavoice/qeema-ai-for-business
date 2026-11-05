<general-contact-us
        :general_contact_us.sync="general_contact_us"
        inline-template>
    <div class="tab-pane fade" id="contact_us" role="tabpanel">
        <div class="card pt-4 mb-6 mb-xl-9">
            <div class="card-body p-9">
                <form @submit.prevent="save">
                    <div class="row">
                        <div class="mb-10 col-md-6">
                            <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                <span>{{trans_admin('mobile_1')}}</span>
                            </label>
                            <input type="number" v-model="mobile_1" class="form-control" placeholder="{{trans_admin('enter_mobile_1')}}"/>
                            <span v-if="form.validation && form.validation['mobile_1']" class="error-block">@{{ form.validation['mobile_1'][0] }}</span>
                        </div>

                        <div class="mb-10 col-md-6">
                            <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                <span>{{trans_admin('mobile_2')}}</span>
                            </label>
                            <input type="number" v-model="mobile_2" class="form-control" placeholder="{{trans_admin('enter_mobile_2')}}"/>
                            <span v-if="form.validation && form.validation['mobile_2']" class="error-block">@{{ form.validation['mobile_2'][0] }}</span>
                        </div>

                        <div class="mb-10 col-md-6">
                            <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                <span>{{trans_admin('email')}}</span>
                            </label>
                            <input type="text" v-model="email" class="form-control " placeholder="{{trans_admin('enter_email')}}"/>
                            <span v-if="form.validation && form.validation['email']" class="error-block">@{{ form.validation['email'][0] }}</span>
                        </div>

{{--                        {!! html_entity_decode(build_fields('about_us_footer',trans_admin('about_us_footer'),null, 'textarea')) !!}--}}

                        <div class="card-footer d-flex justify-content-end py-6 px-1">
                            <button type="submit" class="btn btn-primary" :disabled="form.disabledButton">{{trans_admin('save')}}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</general-contact-us>
