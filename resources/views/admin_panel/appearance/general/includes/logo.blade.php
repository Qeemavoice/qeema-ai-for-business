<general-logo
    :general_logo.sync="general_logo"
    inline-template>
    <div class="tab-pane fade" id="logo" role="tabpanel">
        <div class="card pt-4 mb-6 mb-xl-9">
            <div class="card-body p-9">
                <form @submit.prevent="save">
                    <div class="row">
                        <div class="mb-10 col-md-12">
                            <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                <span class="required">{{trans_admin('favicon')}}</span>
                            </label>
                            <upload-file :_file.sync="favicon"
                                         placeholder="{{trans_admin('favicon')}}"
                                         :dir="'{{\App\Models\Setting::DIR_LOGOS_UPLOADS}}'"
                                         id='favicon'
                                         :type-extension="['jpg', 'jpeg', 'png' ,'svg','ico']"
                                         div-id='div-favicon'>
                            </upload-file>
                            <span v-if="form.validation && form.validation['value.favicon']" class="error-block">@{{ form.validation['value.favicon'][0] }}</span>
                        </div>

{{--                        {!! html_entity_decode(build_fields('alt_favicon',trans_admin('alt_favicon'),null,'textarea')) !!}--}}


                        <div class="mb-10 col-md-12">
                            <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                <span class="required">{{trans_admin('logo')}}</span>
                            </label>
                            <upload-file :_file.sync="header_logo"
                                         placeholder="{{trans_admin('header_logo')}}"
                                         :dir="'{{\App\Models\Setting::DIR_LOGOS_UPLOADS}}'"
                                         id='logo'
                                         :type-extension="['jpg', 'jpeg', 'png' ,'svg','ico']"
                                         div-id='div-c-logo'>
                            </upload-file>
                            <span v-if="form.validation && form.validation['value.header_logo']" class="error-block">@{{ form.validation['value.header_logo'][0] }}</span>
                        </div>

                        {!! html_entity_decode(build_fields('alt_header_logo',trans_admin('alt_header_logo'),null,'textarea')) !!}

                        <div class="card-footer d-flex justify-content-end py-6 px-1">
                            <button type="submit" class="btn btn-primary" :disabled="form.disabledButton">{{trans_admin('save')}}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</general-logo>
