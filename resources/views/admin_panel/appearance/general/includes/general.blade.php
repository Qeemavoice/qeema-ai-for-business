<general-setting
    :general.sync="general_setting"
    inline-template>
    <div class="tab-pane fade active show" id="general" role="tabpanel">
        <div class="card">
            <div class="card-body p-9">
                <form @submit.prevent="save">
                    <div class="row">

                        {!! html_entity_decode(build_fields('website_name',trans_admin('website_name'))) !!}

                        <div class="modal-footer">
                            <button type="submit" class="btn btn-primary" :disabled="form.disabledButton">{{trans_admin('save')}}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</general-setting>
