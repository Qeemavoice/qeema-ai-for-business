<modal-section-home-page
    :home_page_modal_section.sync="home_page_modal_section"
    inline-template>
    <div class="tab-pane fade" id="modal_section" role="tabpanel">
        <div class="card pt-4 mb-6 mb-xl-9">
            <div class="card-body p-9">
                <form @submit.prevent="save">
                    <div class="row">
                        <div class="mb-10 col-md-12">
                            <label class="form-check form-switch form-check-custom form-check-solid">
                                <input class="form-check-input" type="checkbox" v-model="value.is_show" checked="checked">
                                <span class="form-check-label fw-bold text-muted">{{trans_admin('is_show')}}</span>
                            </label>
                        </div>
                        {!! html_entity_decode(build_fields('value.title',trans_admin('title'))) !!}
                        {!! html_entity_decode(build_fields('value.sub_title',trans_admin('sub_title'))) !!}
                        {!! html_entity_decode(build_fields('value.short_description',trans_admin('short_description'), null, 'textarea')) !!}
                        <div class="mb-10 col-md-6">
                            <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                <span class="required">{{trans_admin('file')}}</span>
                            </label>
                            <upload-file :_file.sync="value.file"
                                         placeholder="{{trans_admin('file')}}"
                                         :dir="'{{\App\Models\Setting::DIR_HOME_PAGE_UPLOADS}}'"
                                         id='file'
                                         :file_type="'documents'"
                                         :type-extension="['pdf']"
                                         div-id='div-file'>
                            </upload-file>
                            <span v-if="form.validation && form.validation['value.file']" class="error-block">@{{ form.validation['value.file'][0] }}</span>
                        </div>
                        <div class="card-footer d-flex justify-content-end py-6 px-1">
                            <button type="submit" class="btn btn-primary" :disabled="form.disabledButton">{{trans_admin('save')}}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</modal-section-home-page>
