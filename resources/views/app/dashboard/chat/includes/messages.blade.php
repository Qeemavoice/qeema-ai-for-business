<div class="col-md-8" v-loading="form.loadingDisplay">
    <div style="padding: 18px 15px;border: 1px solid #eee;box-shadow: 2px 3px 7px #dedddd7a;">
        <div class="container-chat pr-4 pr-3" ref="chatContainer"  @scroll="handleScroll" style="height: 550px;overflow-y: scroll;" id="chat-content"  v-chat-scroll>
            <template v-for="(message,index) in messages" v-if="messages">
                <div class="attachment p-1 message">
                    <div class="attachment-summary">
                        <div class="reply-file p-2 ">
                            <div class="media" style="position:relative">
                                <div :class="message.from_user.id ==`{{user()->id}}`?' media-body message rounded mb-3 p-2 bg-info':'media-body message rounded mb-3 p-2 bg-gray message-green text-left'" style="position: relative;!important ">
                                    <div class="rounded mb-3 p-2 " style="position: relative;!important font-size: 16px;color: #f1f1f1;">
                                        <template v-if="message.from_user.id=='{{ user()->id}}'">
                                            <b style="position: relative !important;font-size: 14px !important;">@{{ message.from_user.full_name }}</b>
                                        </template>
                                        <template v-else-if="message.to_user.id=='{{ user()->id }}'">
                                            <b style="color: #000;">@{{ message.from_user.full_name }}</b>
                                        </template>
                                        <template v-else>
                                            <b>message.to_user.full_name</b>
                                        </template>
                                    </div>
                                    <p :class="message.from_user.id ==`{{user()->id}}`? 'my-0 message_text text-white' : 'my-0 message_text'" style="font-size:18px;white-space: inherit;"><b>@{{ message.message }}</b></p>
                                    <div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            {{--                                                    <div class="d-flex justify-content-center div-reponse">--}}
            {{--                                                        <button class="btn-add-message btn btn-warning font-weight-bold" data-id="1">نعم، كيف أؤكد الحجز؟</button>--}}
            {{--                                                        <button class="btn-add-message btn btn-warning font-weight-bold mr-2" data-id="2">لدي استفسار</button>--}}
            {{--                                                    </div>--}}
            {{--                                                    --}}
        </div>
    </div>
    <form action="#" id="addForm" >
        <div class="form-group row">
            <div class="col-md-11 pl-0">
                <textarea v-model="message" class="form-control input_msg message" name="message" placeholder="نص الرسالة" rows="1" style="resize:none;min-height: 39px;"></textarea>
            </div>
            <div class="col-md-1 pr-0 d-flex">
                <button @click="sendMessage" type="button" :disabeld="form.disabledButton" class="btn btn-sm btn-warning send_msg" style="width: 100%;height: 39px;"><i class="far fa-paper-plane"></i>
                    <span class="pay-spin"></span>
                </button>
                <label for="upload" class="btn btn-primary mb-0">
                    <span class="fa fa-upload" aria-hidden="true"></span>
                    <input type="file" v-on:change="uploadMultiFiles" name="files[]"  :disabled="form.disabledButtonUpload" multiple id="upload" style="display:none">

                </label>
            </div>
        </div>
    </form>
</div>
