<div class="tab-pane fade" id="order_chats" role="tab-panel">
    <chat-index :order-id="{{isset($order) ? $order->id : 'null'}}"
                :user-message="{{isset($userMessage)  ? json_encode($userMessage) : 'null'}}"
                inline-template>
        <div class="d-flex flex-column gap-7 gap-lg-10" >
            @if($userMessage)

                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <div class="symbol-group symbol-hover">
                                @if($userMessage->fromUser)
                                    <div class="d-flex align-items-center flex-grow-1">
                                        <div class="symbol symbol-45px me-5">
                                            <img src="{{$userMessage->fromUser->image_url}}" alt="{{$userMessage->fromUser->full_name}}">
                                        </div>
                                        <div class="d-flex flex-column">
                                            <a href="#" class="text-gray-900 text-hover-primary fs-6 fw-bolder">{{$userMessage->fromUser->full_name}}</a>
                                        </div>
                                    </div>
                                @endif
                                @if($userMessage->toUser)
                                    <div class="d-flex align-items-center flex-grow-1">
                                        <div class="symbol symbol-45px me-5">
                                            <img src="{{$userMessage->toUser->image_url}}" alt="{{$userMessage->toUser->full_name}}">
                                        </div>
                                        <div class="d-flex flex-column">
                                            <a href="#" class="text-gray-900 text-hover-primary fs-6 fw-bolder">{{$userMessage->toUser->full_name}}</a>
                                        </div>
                                    </div>
                                @endif
                            </div>
                        </div>
                    </div>

                    <div class="card-body">
                        <div class="scroll-y me-n5 pe-5 h-300px h-lg-auto" data-kt-element="messages" data-kt-scroll="true" data-kt-scroll-activate="{default: false, lg: true}" data-kt-scroll-max-height="auto" data-kt-scroll-dependencies="#kt_header, #kt_toolbar, #kt_footer, #kt_chat_messenger_header, #kt_chat_messenger_footer" data-kt-scroll-wrappers="#kt_content, #kt_chat_messenger_body" data-kt-scroll-offset="5px" style="max-height: 126px;">
                            <div class="d-flex justify-content-start mb-10">
                                <div class="d-flex flex-column align-items-start">
                                    <div class="d-flex align-items-center mb-2">
                                        <div class="symbol symbol-35px symbol-circle">
                                            <img alt="Pic" src="">
                                        </div>
                                        <div class="ms-3">
                                            <a href="#" class="fs-5 fw-bolder text-gray-900 text-hover-primary me-1">Brian Cox</a>
                                            <span class="text-muted fs-7 mb-1">2 mins</span>
                                        </div>
                                    </div>
                                    <div class="p-5 rounded bg-light-info text-dark fw-bold mw-lg-400px text-start" data-kt-element="message-text">How likely are you to recommend our company to your friends and family ?</div>
                                </div>
                            </div>
                            <div class="d-flex justify-content-end mb-10">
                                <div class="d-flex flex-column align-items-end">
                                    <div class="d-flex align-items-center mb-2">
                                        <div class="me-3">
                                            <span class="text-muted fs-7 mb-1">5 mins</span>
                                            <a href="#" class="fs-5 fw-bolder text-gray-900 text-hover-primary ms-1">You</a>
                                        </div>
                                        <div class="symbol symbol-35px symbol-circle">
                                            <img alt="Pic" src="assets/media/avatars/300-1.jpg">
                                        </div>
                                    </div>
                                    <div class="p-5 rounded bg-light-primary text-dark fw-bold mw-lg-400px text-end" data-kt-element="message-text">Hey there, we’re just writing to let you know that you’ve been subscribed to a repository on GitHub.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer pt-4" id="kt_chat_messenger_footer">
                        <textarea class="form-control form-control-flush mb-3" rows="4" data-kt-element="input" placeholder="Type a message"></textarea>
                        <div class="d-flex flex-stack">
                            <div class="d-flex align-items-center me-2">
                                <button class="btn btn-sm btn-icon btn-active-light-primary me-1" type="button" data-bs-toggle="tooltip" title="">
                                    <i class="bi bi-upload fs-3"></i>
                                </button>
                            </div>
                            <button class="btn btn-primary" type="button" :disabled="form.disabledButton">ارسال</button>
                        </div>
                    </div>
                </div>
            @else
                <div class="alert alert-warning">لا يوجد شات</div>
            @endif
        </div>
    </chat-index>
</div>
