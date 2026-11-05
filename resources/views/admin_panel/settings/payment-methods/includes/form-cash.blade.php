<div class="tab-pane fade" id="cash" role="tabpanel">
    <div class="card">
        <div class="card-body p-9">
            <form @submit.prevent="save">

                <div class="mb-10 col-md-12">
                    <label class="form-check form-switch form-check-custom form-check-solid">
                        <input v-model="cash.is_active" class="form-check-input" type="checkbox" checked="checked">
                        <span class="form-check-label fw-bold text-muted">{{trans_admin('active_service')}}</span>
                    </label>
                </div>

                {!! html_entity_decode(build_fields('cash.name',trans_admin('label'))) !!}
{{--                {!! html_entity_decode(build_fields('cash.description',trans_admin('description'),null,'textarea')) !!}--}}

                <div class="card-footer d-flex justify-content-end py-6 px-9">
                    <button type="submit" class="btn btn-primary" :disabled="form.disabledButton">{{trans_admin('save')}}</button>
                </div>
            </form>
        </div>
    </div>
</div>
