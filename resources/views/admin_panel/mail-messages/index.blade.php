@extends('admin_panel.layouts.app')

@push('page-title')
    {{$pageTitle}}
@endpush

@section('content')
    <mail-messages-show :type="`{{request('type')}}`" inline-template>
        <div class="d-flex flex-column flex-lg-row">

            @include('admin_panel.mail-messages.includes.sidebar')

            <div class="flex-lg-row-fluid ms-lg-7 ms-xl-10">
                <div class="card">
                    <div class="card-header align-items-center py-5 gap-2 gap-md-5">
                        <div class="d-flex flex-wrap gap-1">
{{--                            <div class="form-check form-check-sm form-check-custom form-check-solid me-3">--}}
{{--                                <input @click="checkAll" class="form-check-input" type="checkbox" >--}}
{{--                            </div>--}}
{{--                            <div>--}}
{{--                                <a href="#" class="btn btn-sm btn-icon btn-clear btn-active-light-primary" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-start">--}}
{{--                                    <span class="svg-icon svg-icon-2">--}}
{{--                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">--}}
{{--                                            <path d="M11.4343 12.7344L7.25 8.55005C6.83579 8.13583 6.16421 8.13584 5.75 8.55005C5.33579 8.96426 5.33579 9.63583 5.75 10.05L11.2929 15.5929C11.6834 15.9835 12.3166 15.9835 12.7071 15.5929L18.25 10.05C18.6642 9.63584 18.6642 8.96426 18.25 8.55005C17.8358 8.13584 17.1642 8.13584 16.75 8.55005L12.5657 12.7344C12.2533 13.0468 11.7467 13.0468 11.4343 12.7344Z" fill="black"></path>--}}
{{--                                        </svg>--}}
{{--                                    </span>--}}
{{--                                </a>--}}
{{--                                <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-125px py-4" data-kt-menu="true">--}}
{{--                                    <div class="menu-item px-3">--}}
{{--                                        <a href="javascript:;" class="menu-link px-3" data-kt-inbox-listing-filter="show_all">All</a>--}}
{{--                                    </div>--}}
{{--                                    <div class="menu-item px-3">--}}
{{--                                        <a href="javascript:;" class="menu-link px-3" data-kt-inbox-listing-filter="show_read">Marked</a>--}}
{{--                                    </div>--}}
{{--                                    <div class="menu-item px-3">--}}
{{--                                        <a href="javascript:;" class="menu-link px-3" data-kt-inbox-listing-filter="show_unread">Draft</a>--}}
{{--                                    </div>--}}
{{--                                </div>--}}
{{--                            </div>--}}
                            <a href="javascript:;" @click="fetchData(route)" class="btn btn-sm btn-icon btn-clear btn-active-light-primary" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="{{trans_admin('reload')}}">
                                <span class="svg-icon svg-icon-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M14.5 20.7259C14.6 21.2259 14.2 21.826 13.7 21.926C13.2 22.026 12.6 22.0259 12.1 22.0259C9.5 22.0259 6.9 21.0259 5 19.1259C1.4 15.5259 1.09998 9.72592 4.29998 5.82592L5.70001 7.22595C3.30001 10.3259 3.59999 14.8259 6.39999 17.7259C8.19999 19.5259 10.8 20.426 13.4 19.926C13.9 19.826 14.4 20.2259 14.5 20.7259ZM18.4 16.8259L19.8 18.2259C22.9 14.3259 22.7 8.52593 19 4.92593C16.7 2.62593 13.5 1.62594 10.3 2.12594C9.79998 2.22594 9.4 2.72595 9.5 3.22595C9.6 3.72595 10.1 4.12594 10.6 4.02594C13.1 3.62594 15.7 4.42595 17.6 6.22595C20.5 9.22595 20.7 13.7259 18.4 16.8259Z" fill="black"></path>
                                        <path opacity="0.3" d="M2 3.62592H7C7.6 3.62592 8 4.02592 8 4.62592V9.62589L2 3.62592ZM16 14.4259V19.4259C16 20.0259 16.4 20.4259 17 20.4259H22L16 14.4259Z" fill="black"></path>
                                    </svg>
                                </span>
                            </a>
{{--                            <a href="javascript:;" @click="changeTypeAll({{\App\Models\MailMessage::DRAFT_TYPE}})" class="btn btn-sm btn-icon btn-light btn-active-light-primary" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Draft">--}}
{{--                                <span class="svg-icon svg-icon-2">--}}
{{--                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">--}}
{{--                                        <path d="M6 8.725C6 8.125 6.4 7.725 7 7.725H14L18 11.725V12.925L22 9.725L12.6 2.225C12.2 1.925 11.7 1.925 11.4 2.225L2 9.725L6 12.925V8.725Z" fill="black"></path>--}}
{{--                                        <path opacity="0.3" d="M22 9.72498V20.725C22 21.325 21.6 21.725 21 21.725H3C2.4 21.725 2 21.325 2 20.725V9.72498L11.4 17.225C11.8 17.525 12.3 17.525 12.6 17.225L22 9.72498ZM15 11.725H18L14 7.72498V10.725C14 11.325 14.4 11.725 15 11.725Z" fill="black"></path>--}}
{{--                                    </svg>--}}
{{--                                </span>--}}
{{--                            </a>--}}
{{--                            <a href="javascript:;" @click="changeTypeAll({{\App\Models\MailMessage::MARKED_TYPE}})" class="btn btn-sm btn-icon btn-light btn-active-light-primary" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Mark as read">--}}
{{--                                <span class="svg-icon svg-icon-2">--}}
{{--                                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">--}}
{{--                                         <path d="M16.0077 19.2901L12.9293 17.5311C12.3487 17.1993 11.6407 17.1796 11.0426 17.4787L6.89443 19.5528C5.56462 20.2177 4 19.2507 4 17.7639V5C4 3.89543 4.89543 3 6 3H17C18.1046 3 19 3.89543 19 5V17.5536C19 19.0893 17.341 20.052 16.0077 19.2901Z" fill="black" />--}}
{{--                                     </svg>--}}
{{--                                </span>--}}
{{--                            </a>--}}
{{--                            <a href="javascript:;" @click="deleteAll" class="btn btn-sm btn-icon btn-light btn-active-light-primary" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Delete">--}}
{{--                                <span class="svg-icon svg-icon-2">--}}
{{--                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">--}}
{{--                                        <path d="M5 9C5 8.44772 5.44772 8 6 8H18C18.5523 8 19 8.44772 19 9V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V9Z" fill="black"></path>--}}
{{--                                        <path opacity="0.5" d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V5C19 5.55228 18.5523 6 18 6H6C5.44772 6 5 5.55228 5 5V5Z" fill="black"></path>--}}
{{--                                        <path opacity="0.5" d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V4H9V4Z" fill="black"></path>--}}
{{--                                    </svg>--}}
{{--                                </span>--}}
{{--                            </a>--}}
                        </div>
                        <div class="d-flex align-items-center flex-wrap gap-2">
                            <div class="d-flex align-items-center position-relative">
                            <span class="svg-icon svg-icon-2 position-absolute ms-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect opacity="0.5" x="17.0365" y="15.1223" width="8.15546" height="2" rx="1" transform="rotate(45 17.0365 15.1223)" fill="black"></rect>
                                    <path d="M11 19C6.55556 19 3 15.4444 3 11C3 6.55556 6.55556 3 11 3C15.4444 3 19 6.55556 19 11C19 15.4444 15.4444 19 11 19ZM11 5C7.53333 5 5 7.53333 5 11C5 14.4667 7.53333 17 11 17C14.4667 17 17 14.4667 17 11C17 7.53333 14.4667 5 11 5Z" fill="black"></path>
                                </svg>
                            </span>
                                <input type="text" v-model="filter.searchText" @keyup="fetchData(route)" style="width: 29rem;" class="form-control form-control-sm form-control-solid mw-100 min-w-150px min-w-md-200px ps-12" placeholder="{{trans_admin('search_by_name_email_subject_message')}}">
                        </div>
{{--                        <span>--}}
{{--                            <a href="#" class="btn btn-sm btn-icon btn-light btn-active-light-primary" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Sort">--}}
{{--                                <span class="svg-icon svg-icon-2 m-0">--}}
{{--                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 16 15" fill="none">--}}
{{--                                        <rect y="6" width="16" height="3" rx="1.5" fill="black"></rect>--}}
{{--                                        <rect opacity="0.3" y="12" width="8" height="3" rx="1.5" fill="black"></rect>--}}
{{--                                        <rect opacity="0.3" width="12" height="3" rx="1.5" fill="black"></rect>--}}
{{--                                    </svg>--}}
{{--                                </span>--}}
{{--                            </a>--}}
{{--                            <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-125px py-4" data-kt-menu="true">--}}
{{--                                <div class="menu-item px-3">--}}
{{--                                    <a href="#" class="menu-link px-3" data-kt-inbox-listing-filter="filter_newest">Newest</a>--}}
{{--                                </div>--}}
{{--                                <div class="menu-item px-3">--}}
{{--                                    <a href="#" class="menu-link px-3" data-kt-inbox-listing-filter="filter_oldest">Oldest</a>--}}
{{--                                </div>--}}
{{--                                <div class="menu-item px-3">--}}
{{--                                    <a href="#" class="menu-link px-3" data-kt-inbox-listing-filter="filter_unread">Unread</a>--}}
{{--                                </div>--}}
{{--                            </div>--}}
{{--                        </span>--}}
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="dataTables_wrapper dt-bootstrap4 no-footer">
                            <div class="table-responsive">
                                <table class="table table-hover table-row-dashed fs-6 gy-5 my-0 dataTable no-footer">
                                    <thead class="d-none">
                                    <tr>
                                        <th>{{trans_admin('checkbox')}}</th>
                                        <th>{{trans_admin('actions')}}</th>
                                        <th>{{trans_admin('author')}}</th>
                                        <th>{{trans_admin('title')}}</th>
                                        <th>{{trans_admin('date')}}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr v-if="data.length > 0" v-for="row in data">
{{--                                        <td class="ps-9">--}}
{{--                                            <div class="form-check form-check-sm form-check-custom form-check-solid mt-3">--}}
{{--                                                <input @click="checkMessagesPerPage" v-model="checkedMessagesPerPage" :value="row.id" class="form-check-input" type="checkbox" />--}}
{{--                                            </div>--}}
{{--                                        </td>--}}
                                        <td class="min-w-80px" v-if="!row.deleted_at">
{{--                                            <a href="javascript:;" @click="changeType(row.id,row.subject,{{\App\Models\MailMessage::DRAFT_TYPE}})" class="btn btn-icon btn-color-gray-400 btn-sm btn-active-color-primary" data-bs-toggle="tooltip" data-bs-placement="right" title="Draft">--}}
{{--                                                <span class="svg-icon svg-icon-2">--}}
{{--                                                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">--}}
{{--                                                       <path d="M6 8.725C6 8.125 6.4 7.725 7 7.725H14L18 11.725V12.925L22 9.725L12.6 2.225C12.2 1.925 11.7 1.925 11.4 2.225L2 9.725L6 12.925V8.725Z" fill="black"></path>--}}
{{--                                                       <path opacity="0.3" d="M22 9.72498V20.725C22 21.325 21.6 21.725 21 21.725H3C2.4 21.725 2 21.325 2 20.725V9.72498L11.4 17.225C11.8 17.525 12.3 17.525 12.6 17.225L22 9.72498ZM15 11.725H18L14 7.72498V10.725C14 11.325 14.4 11.725 15 11.725Z" fill="black"></path>--}}
{{--                                                   </svg>--}}
{{--                                                </span>--}}
{{--                                            </a>--}}
                                            <a  href="javascript:;" v-if="!row.status=={{\App\Models\MailMessage::MARKED_STATUS}}" @click="changeType(row.id,row.subject,{{\App\Models\MailMessage::MARKED_STATUS}})" class="btn btn-icon btn-color-gray-400 btn-sm btn-active-color-primary" data-bs-toggle="tooltip" data-bs-placement="right" title="{{trans_admin('mark_as_important')}}">
                                                <span class="svg-icon svg-icon-3 mt-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        <path d="M16.0077 19.2901L12.9293 17.5311C12.3487 17.1993 11.6407 17.1796 11.0426 17.4787L6.89443 19.5528C5.56462 20.2177 4 19.2507 4 17.7639V5C4 3.89543 4.89543 3 6 3H17C18.1046 3 19 3.89543 19 5V17.5536C19 19.0893 17.341 20.052 16.0077 19.2901Z" fill="black" />
                                                    </svg>
                                                </span>
                                            </a>

                                            <a  href="javascript:;" @click="deleteRow(row.id,row.subject)" class="btn btn-sm btn-icon btn-light btn-active-light-primary" data-bs-toggle="tooltip" data-bs-placement="top" title="" data-bs-original-title="Delete">
                                                <span class="svg-icon svg-icon-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        <path d="M5 9C5 8.44772 5.44772 8 6 8H18C18.5523 8 19 8.44772 19 9V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V9Z" fill="black"></path>
                                                        <path opacity="0.5" d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V5C19 5.55228 18.5523 6 18 6H6C5.44772 6 5 5.55228 5 5V5Z" fill="black"></path>
                                                        <path opacity="0.5" d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V4H9V4Z" fill="black"></path>
                                                    </svg>
                                                </span>
                                            </a>
                                        </td>
                                        <td class="w-150px w-md-175px">
                                            <a :href="route+'/'+row.id+'/details'" class="d-flex align-items-center text-dark">
                                                <div class="symbol symbol-35px me-3">
                                                    <div class="symbol-label bg-light-danger">
                                                        <span class="text-danger">@{{ (row.full_name.charAt(0)).toUpperCase() }}</span>
                                                    </div>
                                                </div>
                                                <span class="fw-bold">@{{ row.full_name }}</span>
                                            </a>
                                        </td>
                                        <td>
                                            <div class="text-dark mb-1">
                                                <a :href="route+'/'+row.id+'/details'" class="text-dark">
                                                    <span class="fw-bolder">@{{ row.subject }}</span>
                                                    <span class="fw-bolder d-none d-md-inine">-</span> <br>
                                                    <span class="d-md-inine text-muted">@{{ row.content.slice(0, 60) }}...</span>
                                                </a>
                                            </div>
                                            <div class="badge badge-light-warning">@{{ row.show_source }}</div>
                                            <div class="badge badge-light-primary" v-if="row.status=={{\App\Models\MailMessage::MARKED_STATUS}}">@{{ row.show_status }}</div>
                                        </td>
                                        <td class="w-100px text-end fs-7 pe-9">
                                            <span class="fw-bold">@{{ row.format1_created_at }}</span>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="row px-9 pt-3 pb-5">
                                <page-limit v-if="page.totalItems>page.itemsPerPage" :meta="page"></page-limit>

                                <div class="col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end">
                                    <div class="dataTables_paginate paging_simple_numbers">
                                        @include('admin_panel.includes.paginate')
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </mail-messages-show>
@endsection


