<file-modal :file="{{json_encode($homePageModalSection)}}" inline-template>
    <div id="modal_file" class="modal fade onloadMessage" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
{{--                    {{ $homePageModalSection->title->{get_locale()} }}--}}
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                </div>
                <div class="modal-body">
                    <h2>{{ $homePageModalSection->title->{get_locale()} }}</h2>
                    <p> {{ $homePageModalSection->short_description->{get_locale()} }}</p>
                    <form role="form" class="contacthook">
                        <div class="form-group">
                            <label for="email"></label>
                            <input required type="email" name="email" v-model="email" class="form-control" id="email" placeholder="info@email.com">
                            <span v-if="form.validation && form.validation.email" class="error-block">@{{ form.validation.email[0] }}</span>
                        </div>
                        <button type="button" @click="downloadFile" class="btn btn-primary">حمله الآن</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</file-modal>
