<div class="modal fade in" id="modal_rating_details" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel">
    <div class="modal-dialog modal-lg modal-dialog-centered " role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">التفاصيل</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close" style="margin-right:auto;margin-left:inherit"><span>&times;</span></button>
            </div>
            <div class="modal-body" v-if="ratingDetails">
                <div class="row" style="justify-content: center;">
                    <div class="col-md-12">
                        <table class="table table-bordered" id="html_table">
                            <tbody>
                            <tr>
                                <th class="text-center font-weight-bold" colspan="2">
                                    <div class="sound-details">
                                        <div id="div1" class="targetDiv">
                                            <audio controlslist="nodownload"
                                                   :src="ratingDetails.audio_file_url"
                                                   controls="true"
                                                   :id="'voice_audio_'+ratingDetails.voice_id"
                                                   class="ppbutton fa fa-play">
                                            </audio>
                                        </div>
                                    </div>
                                </th>
                            </tr>
                            <tr v-for="(criteria,index) in ratingDetails.criterias">
                                <th class="text-center font-weight-bold">@{{ criteria.criteria.name[$lang] }}</th>
                                <td class="text-center">
                                    <div class="form-valid quality_recordings_add">
                                        <star-rating
                                            :rating="criteria.value"
                                            :read-only="true"
                                            :star-size="25"
                                            border-color="rgb(252, 215, 3)"
                                            :rounded-corners="true"
                                            :show-rating="false">
                                        </star-rating>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th class="text-center font-weight-bold" colspan="2">
                                    <textarea readonly class="form-control opinion_of_work"  rows="6" autocomplete="off">@{{ ratingDetails.response }}</textarea>
                                </th>
                            </tr>
{{--                            <tr>--}}
{{--                                <th class="text-center font-weight-bold">مشاركة</th>--}}

{{--                                <td class="text-center blog-share">--}}
{{--                                    {!! Share::page(url()->current(), $reservation->opinion_of_work, [], '<ul class="social-link">', '</ul>')--}}
{{--                                        ->telegram()--}}
{{--                                        ->whatsapp()--}}
{{--                                        ->facebook()--}}
{{--                                        ->linkedin()--}}
{{--                                        ->twitter()--}}
{{--                                    !!}--}}
{{--                                </td>--}}
{{--                            </tr>--}}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal" style="margin-left: 0.25rem;"> إغلاق</button>
            </div>
        </div>
    </div>
</div>
