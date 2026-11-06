<faqs-section-home-page
    :home_page_faqs_section.sync="home_page_faqs_section"
    inline-template>
    <div class="tab-pane fade" id="faqs_section" role="tabpanel">
        <div class="card pt-4 mb-6 mb-xl-9">
            <div class="card-body p-9">
                <form @submit.prevent="save">
                    <div class="row">
                        <div class="col-lg-6 mb-8">
                            <label for="categories" class="form-label mb-2">{{trans_admin('faqs')}}</label>
                            <div>
                                <el-select v-model="value.faqs_ids"
                                           :loading="form.loading"
                                           :remote-method="getFaqs"
                                           class="w-100"
                                           multiple
                                           filterable
                                           remote
                                           reserve-keyword
                                           no-data-text="{{trans_admin('no_data')}}"
                                           placeholder="{{trans_admin('select')}}">
                                    <el-option v-for="faq in faqs"
                                               :key="faq.id"
                                               :value="faq.id"
                                               :label="faq.title[$lang]">
                                        @{{ faq.title[$lang] }}
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
</faqs-section-home-page>
