<general-footer
        :general_footer.sync="general_footer"
        inline-template>

    <div class="tab-pane fade" id="footer" role="tabpanel">
        <div class="card pt-4 mb-6 mb-xl-9">
            <div class="card-body p-9">
                <form @submit.prevent="save">
                    <div class="row">

                        {!! html_entity_decode(build_fields('footer_about_site',trans_admin('footer_about_site'), null, 'textarea')) !!}

                        <div class="card-footer d-flex justify-content-end py-6 px-1">
                            <button type="submit" class="btn btn-primary" :disabled="form.disabledButton">{{trans_admin('save')}}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</general-footer>
