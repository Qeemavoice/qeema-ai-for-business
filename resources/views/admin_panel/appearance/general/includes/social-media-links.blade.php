<general-social-media-links
    :general_social_media_links.sync="general_social_media_links"
    inline-template>
    <div class="tab-pane fade" id="social_media_links" role="tabpanel">
        <div class="card pt-4 mb-6 mb-xl-9">
            <div class="card-body p-9">
                <form @submit.prevent="save">
                    <div class="row">
                        <div class="fv-row w-100 ">
                            <label class="form-label">{{trans_admin('facebook')}}</label>
                            <input type="text" v-model="facebook" class="form-control mb-2">
                            <span v-if="form.validation && form.validation['facebook']" class="error-block">@{{ form.validation['facebook'][0] }}</span>
                        </div>

                        <div class="fv-row w-100 mt-5">
                            <label class="form-label">{{trans_admin('youtube')}}</label>
                            <input type="text" v-model="youtube" class="form-control mb-2">
                            <span v-if="form.validation && form.validation['youtube']" class="error-block">@{{ form.validation['youtube'][0] }}</span>
                        </div>

                        <div class="fv-row w-100 mt-5">
                            <label class="form-label">{{trans_admin('tiktok')}}</label>
                            <input type="text" v-model="tiktok" class="form-control mb-2">
                            <span v-if="form.validation && form.validation['tiktok']" class="error-block">@{{ form.validation['tiktok'][0] }}</span>
                        </div>
                        <div class="fv-row w-100 mt-5">
                            <label class="form-label">{{trans_admin('twitter')}}</label>
                            <input type="text" v-model="twitter" class="form-control mb-2">
                            <span v-if="form.validation && form.validation['twitter']" class="error-block">@{{ form.validation['twitter'][0] }}</span>
                        </div>
                        <div class="fv-row w-100 mt-5">
                            <label class="form-label">{{trans_admin('instagram')}}</label>
                            <input type="text" v-model="instagram" class="form-control mb-2">
                            <span v-if="form.validation && form.validation['instagram']" class="error-block">@{{ form.validation['instagram'][0] }}</span>
                        </div>
                        <div class="fv-row w-100 mt-5">
                            <label class="form-label">{{trans_admin('linkedin')}}</label>
                            <input type="text" v-model="linkedin" class="form-control mb-2">
                            <span v-if="form.validation && form.validation['linkedin']" class="error-block">@{{ form.validation['linkedin'][0] }}</span>
                        </div>

                        <div class="fv-row w-100 mt-5 mb-5">
                            <label class="form-label">{{trans_admin('whatsapp')}}</label>
                            <input type="text" v-model="whatsapp" class="form-control mb-2">
                            <span v-if="form.validation && form.validation['whatsapp']" class="error-block">@{{ form.validation['whatsapp'][0] }}</span>
                        </div>
                        <div class="card-footer d-flex justify-content-end py-6 px-1">
                            <button type="submit" class="btn btn-primary" :disabled="form.disabledButton">{{trans_admin('save')}}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</general-social-media-links>
