<welcome-section-home-page
        :home_page_welcome_section.sync="home_page_welcome_section"
        inline-template>

    <div class="tab-pane fade active show" id="welcome_section" role="tabpanel">
        <div class="card pt-4 mb-6 mb-xl-9">
            <div class="card-body p-9">
                <form @submit.prevent="save">
                    <div class="row">
                        {!! html_entity_decode(build_fields('value.title',trans_admin('title'))) !!}
                        {!! html_entity_decode(build_fields('value.short_description',trans_admin('short_description'), null, 'textarea')) !!}
                        <div class="mb-10 col-md-6">
                            <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                <span class="required">{{trans_admin('video_url')}}</span>
                            </label>
                            <input type="text" v-model="value.video_url" class="form-control" placeholder="{{trans_admin('video_url')}}"/>
                            <span v-if="form.validation && form.validation['value.video_url']" class="error-block">@{{ form.validation['value.video_url'][0] }}</span>
                        </div>
                        <div class="mb-10 col-md-6">
                            <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                <span class="required">{{trans_admin('image')}}</span>
                            </label>
                            <upload-file :_file.sync="value.image"
                                         placeholder="{{trans_admin('image')}}"
                                         :dir="'{{\App\Models\Setting::DIR_HOME_PAGE_UPLOADS}}'"
                                         id='image'
                                         :type-extension="['jpg', 'jpeg', 'png' ,'svg']"
                                         div-id='div-image'>
                            </upload-file>
                            <span v-if="form.validation && form.validation['value.image']" class="error-block">@{{ form.validation['value.image'][0] }}</span>
                        </div>
                        <div class="card-footer d-flex justify-content-end py-6 px-1">
                            <button type="submit" class="btn btn-primary" :disabled="form.disabledButton">{{trans_admin('save')}}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</welcome-section-home-page>
