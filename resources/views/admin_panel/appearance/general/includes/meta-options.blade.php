<general-meta-options
    :general.sync="general_meta_options"
    inline-template>
    <div class="tab-pane fade" id="meta_options" role="tabpanel">
        <div class="card pt-4">
            <div class="card-body p-9">
                <form @submit.prevent="save">
                    <div class="row">

{{--                        {!! html_entity_decode(build_fields('meta_title',trans_admin('meta_title'),null,null,null,trans_admin('set_a_meta_tag_title'))) !!}--}}

                        {!! html_entity_decode(build_fields('meta_keyword',trans_admin('meta_keyword'), null, 'textarea',null,"")) !!}

                        {!! html_entity_decode(build_fields('meta_description',trans_admin('description'), null, 'textarea',null,trans_admin('set_a_meta_tag_description'))) !!}

                        <div class="card-footer d-flex justify-content-end py-6 px-1">
                            <button type="submit" class="btn btn-primary" :disabled="form.disabledButton">{{trans_admin('save')}}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</general-meta-options>
