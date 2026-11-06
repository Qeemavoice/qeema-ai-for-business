<voices-section-home-page
    :home_page_voices_section.sync="home_page_voices_section"
    inline-template>
    <div class="tab-pane fade" id="voices_section" role="tabpanel">
        <div class="card pt-4 mb-6 mb-xl-9">
            <div class="card-body p-9">
                <form @submit.prevent="save">
                    <div class="row">
                        {!! html_entity_decode(build_fields('value.title',trans_admin('title'))) !!}
                        {!! html_entity_decode(build_fields('value.sub_title',trans_admin('sub_title'), null, 'textarea')) !!}
                        <div class="col-lg-6 mb-8">
                            <label for="categories" class="form-label mb-2">{{trans_admin('voices')}}</label>
                            <div>
                                <el-select v-model="value.voices_ids"
                                           :loading="form.loadingVoiceActorList"
                                           :remote-method="getVoices"
                                           class="w-100"
                                           multiple
                                           filterable
                                           remote
                                           reserve-keyword
                                           no-data-text="{{trans_admin('no_data')}}"
                                           placeholder="{{trans_admin('select')}}">
                                    <el-option v-for="voice in voices"
                                               :key="voice.id"
                                               :value="voice.id"
                                               :label="voice.title[$lang]">
                                        @{{ voice.title[$lang] }}
                                    </el-option>
                                </el-select>
                            </div>
                            <span v-if="form.validation && form.validation.value.voices_ids" class="error-block">@{{ form.validation.value.voices_ids[0] }}</span>
                        </div>
                        <div class="card-footer d-flex justify-content-end py-6 px-1">
                            <button type="submit" class="btn btn-primary" :disabled="form.disabledButton">{{trans_admin('save')}}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</voices-section-home-page>
