@extends('admin_panel.layouts.app')

@push('page-title')
    {{trans_admin('admins')}}
@endpush

@section('content')
    <mail-message-details inline-template>
        <div class="d-flex flex-column flex-lg-row">
            @include('admin_panel.mail-messages.includes.sidebar')

            <div class="flex-lg-row-fluid ms-lg-7 ms-xl-10">
                <div class="card">
                    <div class="card-header align-items-center py-5 gap-5">
                        <div class="d-flex">
                            <a href="{{route_admin('mailMessage.index')}}" class="btn btn-sm btn-icon btn-clear btn-active-light-primary me-3" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Back">
                                <span class="svg-icon svg-icon-1 m-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <rect opacity="0.5" x="6" y="11" width="13" height="2" rx="1" fill="black"></rect>
                                        <path d="M8.56569 11.4343L12.75 7.25C13.1642 6.83579 13.1642 6.16421 12.75 5.75C12.3358 5.33579 11.6642 5.33579 11.25 5.75L5.70711 11.2929C5.31658 11.6834 5.31658 12.3166 5.70711 12.7071L11.25 18.25C11.6642 18.6642 12.3358 18.6642 12.75 18.25C13.1642 17.8358 13.1642 17.1642 12.75 16.75L8.56569 12.5657C8.25327 12.2533 8.25327 11.7467 8.56569 11.4343Z" fill="black"></path>
                                    </svg>
                                </span>
                            </a>
{{--                            <a href="#" class="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Draft">--}}
{{--                                <span class="svg-icon svg-icon-2 m-0">--}}
{{--                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">--}}
{{--                                        <path d="M6 8.725C6 8.125 6.4 7.725 7 7.725H14L18 11.725V12.925L22 9.725L12.6 2.225C12.2 1.925 11.7 1.925 11.4 2.225L2 9.725L6 12.925V8.725Z" fill="black"></path>--}}
{{--                                        <path opacity="0.3" d="M22 9.72498V20.725C22 21.325 21.6 21.725 21 21.725H3C2.4 21.725 2 21.325 2 20.725V9.72498L11.4 17.225C11.8 17.525 12.3 17.525 12.6 17.225L22 9.72498ZM15 11.725H18L14 7.72498V10.725C14 11.325 14.4 11.725 15 11.725Z" fill="black"></path>--}}
{{--                                    </svg>--}}
{{--                                </span>--}}
{{--                            </a>--}}
{{--                            <a href="#" class="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Spam">--}}
{{--                                <span class="svg-icon svg-icon-2 m-0">--}}
{{--                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">--}}
{{--                                        <rect opacity="0.3" x="2" y="2" width="20" height="20" rx="10" fill="black"></rect>--}}
{{--                                        <rect x="11" y="14" width="7" height="2" rx="1" transform="rotate(-90 11 14)" fill="black"></rect>--}}
{{--                                        <rect x="11" y="17" width="2" height="2" rx="1" transform="rotate(-90 11 17)" fill="black"></rect>--}}
{{--                                    </svg>--}}
{{--                                </span>--}}
{{--                            </a>--}}
                            <a href="javascript:;" @click="deleteRow({{$message->id}},'{{$message->subject}}')" class="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Delete">
                                <span class="svg-icon svg-icon-2 m-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M5 9C5 8.44772 5.44772 8 6 8H18C18.5523 8 19 8.44772 19 9V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V9Z" fill="black"></path>
                                        <path opacity="0.5" d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V5C19 5.55228 18.5523 6 18 6H6C5.44772 6 5 5.55228 5 5V5Z" fill="black"></path>
                                        <path opacity="0.5" d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V4H9V4Z" fill="black"></path>
                                    </svg>
                                </span>
                            </a>

{{--                            <a href="#" class="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Mark as read">--}}
{{--                                <span class="svg-icon svg-icon-2 m-0">--}}
{{--                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">--}}
{{--                                        <rect opacity="0.5" x="7" y="2" width="14" height="16" rx="3" fill="black"></rect>--}}
{{--                                        <rect x="3" y="6" width="14" height="16" rx="3" fill="black"></rect>--}}
{{--                                    </svg>--}}
{{--                                </span>--}}
{{--                            </a>--}}

{{--                            <a href="#" class="btn btn-sm btn-icon btn-light btn-active-light-primary" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Move">--}}
{{--                                <span class="svg-icon svg-icon-2 m-0">--}}
{{--                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">--}}
{{--                                        <rect opacity="0.3" width="12" height="2" rx="1" transform="matrix(-1 0 0 1 15.5 11)" fill="black"></rect>--}}
{{--                                        <path d="M13.6313 11.6927L11.8756 10.2297C11.4054 9.83785 11.3732 9.12683 11.806 8.69401C12.1957 8.3043 12.8216 8.28591 13.2336 8.65206L16.1592 11.2526C16.6067 11.6504 16.6067 12.3496 16.1592 12.7474L13.2336 15.3479C12.8216 15.7141 12.1957 15.6957 11.806 15.306C11.3732 14.8732 11.4054 14.1621 11.8756 13.7703L13.6313 12.3073C13.8232 12.1474 13.8232 11.8526 13.6313 11.6927Z" fill="black"></path>--}}
{{--                                        <path d="M8 5V6C8 6.55228 8.44772 7 9 7C9.55228 7 10 6.55228 10 6C10 5.44772 10.4477 5 11 5H18C18.5523 5 19 5.44772 19 6V18C19 18.5523 18.5523 19 18 19H11C10.4477 19 10 18.5523 10 18C10 17.4477 9.55228 17 9 17C8.44772 17 8 17.4477 8 18V19C8 20.1046 8.89543 21 10 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H10C8.89543 3 8 3.89543 8 5Z" fill="#C4C4C4"></path>--}}
{{--                                    </svg>--}}
{{--                                </span>--}}
{{--                            </a>--}}
                        </div>
{{--                        <div class="d-flex align-items-center">--}}
{{--                            <span class="fw-bold text-muted me-2">1 - 50 of 235</span>--}}
{{--                            <a href="#" class="btn btn-sm btn-icon btn-light btn-active-light-primary me-3" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Previous message">--}}
{{--                                <span class="svg-icon svg-icon-2 m-0">--}}
{{--                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">--}}
{{--                                        <path d="M11.2657 11.4343L15.45 7.25C15.8642 6.83579 15.8642 6.16421 15.45 5.75C15.0358 5.33579 14.3642 5.33579 13.95 5.75L8.40712 11.2929C8.01659 11.6834 8.01659 12.3166 8.40712 12.7071L13.95 18.25C14.3642 18.6642 15.0358 18.6642 15.45 18.25C15.8642 17.8358 15.8642 17.1642 15.45 16.75L11.2657 12.5657C10.9533 12.2533 10.9533 11.7467 11.2657 11.4343Z" fill="black"></path>--}}
{{--                                    </svg>--}}
{{--                                </span>--}}
{{--                            </a>--}}
{{--                            <a href="#" class="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Next message">--}}
{{--                                <span class="svg-icon svg-icon-2 m-0">--}}
{{--                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">--}}
{{--                                        <path d="M12.6343 12.5657L8.45001 16.75C8.0358 17.1642 8.0358 17.8358 8.45001 18.25C8.86423 18.6642 9.5358 18.6642 9.95001 18.25L15.4929 12.7071C15.8834 12.3166 15.8834 11.6834 15.4929 11.2929L9.95001 5.75C9.5358 5.33579 8.86423 5.33579 8.45001 5.75C8.0358 6.16421 8.0358 6.83579 8.45001 7.25L12.6343 11.4343C12.9467 11.7467 12.9467 12.2533 12.6343 12.5657Z" fill="black"></path>--}}
{{--                                    </svg>--}}
{{--                                </span>--}}
{{--                            </a>--}}
{{--                        </div>--}}
                    </div>
                    <div class="card-body">
                        <div class="d-flex flex-wrap gap-2 justify-content-between mb-8">
                            <div class="d-flex align-items-center flex-wrap gap-2">
                                <h2 class="fw-bold me-3 my-1">{{$message->subject}}</h2>
{{--                                <span class="badge badge-light-primary my-1 me-2">inbox</span>--}}
{{--                                <span class="badge badge-light-danger my-1">important</span>--}}
                            </div>
{{--                            <div class="d-flex">--}}
{{--                                <a href="#" class="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Sort">--}}
{{--                                    <span class="svg-icon svg-icon-2 m-0">--}}
{{--                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">--}}
{{--                                            <path d="M7 6.59998V20C7 20.6 7.4 21 8 21C8.6 21 9 20.6 9 20V6.59998H7ZM15 17.4V4C15 3.4 15.4 3 16 3C16.6 3 17 3.4 17 4V17.4H15Z" fill="black"></path>--}}
{{--                                            <path opacity="0.3" d="M3 6.59999H13L8.7 2.3C8.3 1.9 7.7 1.9 7.3 2.3L3 6.59999ZM11 17.4H21L16.7 21.7C16.3 22.1 15.7 22.1 15.3 21.7L11 17.4Z" fill="black"></path>--}}
{{--                                        </svg>--}}
{{--                                    </span>--}}
{{--                                </a>--}}
{{--                                <a href="#" class="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Print">--}}
{{--                                    <i class="bi bi-printer-fill fs-2"></i>--}}
{{--                                </a>--}}
{{--                            </div>--}}
                        </div>
                        <div data-kt-inbox-message="message_wrapper">
                            <div class="d-flex flex-wrap gap-2 flex-stack cursor-pointer" data-kt-inbox-message="header">
                                <div class="d-flex align-items-center">
                                    <div class="symbol symbol-50 me-4">
                                        <div class="symbol-label bg-light-danger">
                                            <span class="text-danger">{{trans_admin('image')}}</span>
                                        </div>
                                    </div>
                                    <div class="pe-5">
                                        <div class="d-flex align-items-center flex-wrap gap-1">
                                            <a href="#" class="fw-bolder text-dark text-hover-primary">{{$message->full_name}}</a>
                                            <span class="svg-icon svg-icon-7 svg-icon-success mx-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" version="1.1">
                                                    <circle fill="#000000" cx="12" cy="12" r="8"></circle>
                                                </svg>
                                            </span>
                                            <span class="text-muted fw-bolder">{{$message->humans_created_at}}</span>
                                        </div>
                                        <div data-kt-inbox-message="details">
                                            <span class="text-muted fw-bold">to me</span>
                                            <a href="#" class="me-1" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-start">
                                                <span class="svg-icon svg-icon-5 m-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        <path d="M11.4343 12.7344L7.25 8.55005C6.83579 8.13583 6.16421 8.13584 5.75 8.55005C5.33579 8.96426 5.33579 9.63583 5.75 10.05L11.2929 15.5929C11.6834 15.9835 12.3166 15.9835 12.7071 15.5929L18.25 10.05C18.6642 9.63584 18.6642 8.96426 18.25 8.55005C17.8358 8.13584 17.1642 8.13584 16.75 8.55005L12.5657 12.7344C12.2533 13.0468 11.7467 13.0468 11.4343 12.7344Z" fill="black"></path>
                                                    </svg>
                                                </span>
                                            </a>
                                            <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-300px p-4" data-kt-menu="true">
                                                <table class="table mb-0">
                                                    <tbody>
                                                    <tr>
                                                        <td class="w-75px text-muted">{{trans_admin('from')}}</td>
                                                        <td>{{$message->full_name}}</td>
                                                    </tr>
                                                    <tr>
                                                        <td class="text-muted">{{trans_admin('date')}}</td>
                                                        <td>{{$message->format2_created_at}}</td>
                                                    </tr>
                                                    <tr>
                                                        <td class="text-muted">{{trans_admin('subject')}}</td>
                                                        <td>{{$message->subject}}</td>
                                                    </tr>
{{--                                                    <tr>--}}
{{--                                                        <td class="text-muted">Reply-to</td>--}}
{{--                                                        <td>emma@intenso.com</td>--}}
{{--                                                    </tr>--}}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div class="text-muted fw-bold mw-450px d-none" data-kt-inbox-message="preview">With resrpect, i must disagree with Mr.Zinsser. We all know the most part of important part....</div>
                                    </div>
                                </div>
                                <div class="d-flex align-items-center flex-wrap gap-2">
                                    <span class="fw-bold text-muted text-end me-3">{{$message->format2_created_at}}</span>
{{--                                    <div class="d-flex">--}}
{{--                                        <a href="#" class="btn btn-sm btn-icon btn-clear btn-active-light-primary me-3" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Star">--}}
{{--                                            <span class="svg-icon svg-icon-2 m-0">--}}
{{--                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">--}}
{{--                                                    <path d="M11.1359 4.48359C11.5216 3.82132 12.4784 3.82132 12.8641 4.48359L15.011 8.16962C15.1523 8.41222 15.3891 8.58425 15.6635 8.64367L19.8326 9.54646C20.5816 9.70867 20.8773 10.6186 20.3666 11.1901L17.5244 14.371C17.3374 14.5803 17.2469 14.8587 17.2752 15.138L17.7049 19.382C17.7821 20.1445 17.0081 20.7069 16.3067 20.3978L12.4032 18.6777C12.1463 18.5645 11.8537 18.5645 11.5968 18.6777L7.69326 20.3978C6.99192 20.7069 6.21789 20.1445 6.2951 19.382L6.7248 15.138C6.75308 14.8587 6.66264 14.5803 6.47558 14.371L3.63339 11.1901C3.12273 10.6186 3.41838 9.70867 4.16744 9.54646L8.3365 8.64367C8.61089 8.58425 8.84767 8.41222 8.98897 8.16962L11.1359 4.48359Z" fill="black"></path>--}}
{{--                                                </svg>--}}
{{--                                            </span>--}}
{{--                                        </a>--}}
{{--                                        <a href="#" class="btn btn-sm btn-icon btn-clear btn-active-light-primary me-3" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Mark as important">--}}
{{--                                            <span class="svg-icon svg-icon-2 m-0">--}}
{{--                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">--}}
{{--                                                    <path d="M16.0077 19.2901L12.9293 17.5311C12.3487 17.1993 11.6407 17.1796 11.0426 17.4787L6.89443 19.5528C5.56462 20.2177 4 19.2507 4 17.7639V5C4 3.89543 4.89543 3 6 3H17C18.1046 3 19 3.89543 19 5V17.5536C19 19.0893 17.341 20.052 16.0077 19.2901Z" fill="black"></path>--}}
{{--                                                </svg>--}}
{{--                                            </span>--}}
{{--                                        </a>--}}
{{--                                    </div>--}}
                                </div>
                            </div>
                            <div class="collapse fade show" data-kt-inbox-message="message">
                                <div class="py-5">
                                    <p>{{$message->content}}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </mail-message-details>
@endsection
