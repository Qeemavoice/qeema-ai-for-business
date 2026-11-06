<works-section-home-page
    :home_page_works_section.sync="home_page_works_section"
    inline-template>
    <div class="tab-pane fade" id="works_section" role="tabpanel">
        <div class="card pt-4 mb-6 mb-xl-9">
            <div class="card-body p-9">
                <form @submit.prevent="save">
                    <div class="row">
                        {!! html_entity_decode(build_fields('value.title',trans_admin('title'))) !!}
                        {!! html_entity_decode(build_fields('value.sub_title',trans_admin('sub_title'), null, 'textarea')) !!}
                        <div class="card-footer d-flex justify-content-end py-6 px-1">
                            <button type="submit" class="btn btn-primary" :disabled="form.disabledButton">{{trans_admin('save')}}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</works-section-home-page>
