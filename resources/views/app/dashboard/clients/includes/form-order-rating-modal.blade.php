<div class="modal fade in" id="rating_form" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <form action="#" class="addNewrating" method="post">
                <div class="modal-header">
                    <h6 class="modal-title" style="display:inline-block" id="exampleModalLabel">تقييم العمل </h6>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" style="margin-left: 0px;"><span>&times;</span></button>
                </div>
                <div class="modal-body" v-loading="form.loadingDisplay">
                    <feedback-form :is-client-rated="{{isset($isClientRated) ? $isClientRated : false}}"
                                   :order-id="{{isset($order) ? $order->id : 'null'}}"
                                   inline-template>
                        <div class="row" style="justify-content: center;">
                            <div class="col-md-12">
                                <table class="table table-bordered" id="html_table">
                                    <tbody>
                                    <tr><th class="text-center font-weight-bold" colspan="2">  شاركنا تقييمك للعمل </th></tr>
                                    <tr>
                                        <th class="text-center font-weight-bold" colspan="2">
                                            <div class="sound-details">
                                                <div id="div1" class="targetDiv">
                                                    <audio controlslist="nodownload"
                                                           src="{{$voiceItem->details->voice_audio_file_url}}"
                                                           controls="true"
                                                           id="voice_audio_`{{$voiceItem->itemable_id}}`"
                                                           class="ppbutton fa fa-play">
                                                    </audio>
                                                </div>
                                            </div>
                                        </th>
                                    </tr>
                                    <tr><th class="text-center font-weight-bold" colspan="2"> رأيك بالعمل </th></tr>
                                    <tr v-for="(criteria,index) in criterias">
                                        <th class="text-center font-weight-bold">@{{ criteria.name }}</th>
                                        <td class="text-center">
                                            <div class="form-valid pull-right  quality_recordings_add">
                                                <star-rating
                                                    @rating-selected ="changeRate($event,criteria.id,index)"
                                                    :star-size="25"
                                                    id="criteria"
                                                    border-color="rgb(252, 215, 3)"
                                                    :rounded-corners="true"
                                                    :show-rating="false">
                                                </star-rating>
                                                <span v-if="form.validation && form.validation.criterias" class="error-block">@{{ form.validation.criterias[0] }}</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th class="text-center font-weight-bold" colspan="2">
                                            <textarea v-model="rating.comment" class="form-control opinion_of_work" placeholder=" اكتب رأيك " rows="6" autocomplete="off"></textarea>
                                            <span v-if="form.validation && form.validation.comment" class="error-block">@{{ form.validation.comment[0] }}</span>
                                        </th>
                                    </tr>
                                    <tr>
                                        <td class="text-center" colspan="2">
                                            <button type="button" @click="sendFeedback" :disabled="form.disabledButton" class="btn btn-warning rating-reservation font-weight-bold" style="margin-right:0.25rem;color: #fff;">تــقــيـيـــــــــم</button>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </feedback-form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal" style="margin-left: 0.25rem;"> إغلاق</button>
                </div>
            </form>
        </div>
    </div>
</div>
