@extends('admin_panel.layouts.app')

@push('page-title')
    {{$pageTitle}}
@endpush

@section('content')
    <mail-message-form inline-template>
        <div class="d-flex flex-column flex-lg-row">

            @include('admin_panel.mail-messages.includes.sidebar')

            <div class="flex-lg-row-fluid ms-lg-7 ms-xl-10">
                <div class="card">
                    <div class="card-header align-items-center">
                        <div class="card-title">
                            <h2>Compose Message</h2>
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <form id="kt_inbox_compose_form">
                            <div class="d-block">
                                <div class="d-flex align-items-center border-bottom px-8 min-h-50px">
                                    <div class="text-dark fw-bolder w-75px">To:</div>
                                    <input type="text" class="form-control form-control-transparent border-0" name="compose_to" value="" data-kt-inbox-form="tagify"/>
                                    <div class="ms-auto w-75px text-end">
                                        <span class="text-muted fs-bold cursor-pointer text-hover-primary me-2" data-kt-inbox-form="cc_button">Cc</span>
                                        <span class="text-muted fs-bold cursor-pointer text-hover-primary" data-kt-inbox-form="bcc_button">Bcc</span>
                                    </div>
                                </div>
                                <div class="d-none align-items-center border-bottom ps-8 pe-5 min-h-50px" data-kt-inbox-form="cc">
                                    <div class="text-dark fw-bolder w-75px">Cc:</div>
                                    <input type="text" class="form-control form-control-transparent border-0" name="compose_cc" value="" data-kt-inbox-form="tagify"/>
                                    <span class="btn btn-clean btn-xs btn-icon" data-kt-inbox-form="cc_close">
                                    <i class="la la-close"></i>
                                </span>
                                </div>
                                <div class="d-none align-items-center border-bottom inbox-to-bcc ps-8 pe-5 min-h-50px" data-kt-inbox-form="bcc">
                                    <div class="text-dark fw-bolder w-75px">Bcc:</div>
                                    <input type="text" class="form-control form-control-transparent border-0" name="compose_bcc" value="" data-kt-inbox-form="tagify"/>
                                    <span class="btn btn-clean btn-xs btn-icon" data-kt-inbox-form="bcc_close">
                                    <i class="la la-close"></i>
                                </span>
                                </div>
                                <div class="border-bottom">
                                    <input class="form-control form-control-transparent border-0 px-8 min-h-45px" name="compose_subject" placeholder="Subject"/>
                                </div>
                                <div id="kt_inbox_form_editor" class="bg-transparent border-0 h-350px px-3"></div>
                                <div class="dropzone dropzone-queue px-8 py-4" id="kt_inbox_reply_attachments" data-kt-inbox-form="dropzone">
                                    <div class="dropzone-items">
                                        <div class="dropzone-item" style="display:none">
                                            <div class="dropzone-file">
                                                <div class="dropzone-filename" title="some_image_file_name.jpg">
                                                    <span data-dz-name="">some_image_file_name.jpg</span>
                                                    <strong>(<span data-dz-size="">340kb</span>)</strong>
                                                </div>
                                                <div class="dropzone-error" data-dz-errormessage=""></div>
                                            </div>
                                            <div class="dropzone-progress">
                                                <div class="progress">
                                                    <div class="progress-bar bg-primary" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-dz-uploadprogress=""></div>
                                                </div>
                                            </div>
                                            <div class="dropzone-toolbar">
                                            <span class="dropzone-delete" data-dz-remove="">
                                                <i class="bi bi-x fs-1"></i>
                                            </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="d-flex flex-stack flex-wrap gap-2 py-5 ps-8 pe-5 border-top">
                                <div class="d-flex align-items-center me-3">
                                    <div class="btn-group me-4">
                                    <span class="btn btn-primary fs-bold px-6" data-kt-inbox-form="send">
                                        <span class="indicator-label">Send</span>
                                        <span class="indicator-progress">Please wait...
                                            <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
                                        </span>
                                    </span>
                                    </div>
                                    @include('admin_panel.includes.buttons.cancel')
                                </div>
                                <div class="d-flex align-items-center">


                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </mail-message-form>

@endsection
