<booking-steps-section-home-page
    :home_page_booking_steps_section.sync="home_page_booking_steps_section"
    inline-template>
    <div class="tab-pane fade" id="booking_steps_section" role="tabpanel">
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
</booking-steps-section-home-page>
