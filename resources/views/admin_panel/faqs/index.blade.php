@extends('admin_panel.layouts.app')

@push('page-title')
    {{$pageTitle}}
@endpush

@section('content')
    <faqs-show inline-template>
        <div class="card">
            <div class="card-header border-0 pt-6">
                <div class="card-title">
                    <div class="d-flex align-items-center position-relative my-1">
                        <span class="svg-icon svg-icon-1 position-absolute ms-6">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <rect opacity="0.5" x="17.0365" y="15.1223" width="8.15546" height="2" rx="1" transform="rotate(45 17.0365 15.1223)" fill="black"></rect>
                                <path d="M11 19C6.55556 19 3 15.4444 3 11C3 6.55556 6.55556 3 11 3C15.4444 3 19 6.55556 19 11C19 15.4444 15.4444 19 11 19ZM11 5C7.53333 5 5 7.53333 5 11C5 14.4667 7.53333 17 11 17C14.4667 17 17 14.4667 17 11C17 7.53333 14.4667 5 11 5Z" fill="black"></path>
                            </svg>
                        </span>
                        <input type="text" placeholder="{{trans_admin('search')}}" v-model="filter.searchText" @keyup="fetchData(route)" class="form-control form-select-sm form-control-solid w-350px ps-14">
                    </div>
                </div>

                <div class="card-toolbar">
                    @include('admin_panel.includes.buttons.create')
                </div>
            </div>
            <div class="card-body p-lg-15">
                <div class="mb-13">
                    <div class="row">
                        <div class="col-md-12 pe-md-10 mb-10 mb-md-0">
                            <div v-if="data.length>0" v-for="row in data" class="m-0">
                                <div class="row">
                                    <div class="col-md-10 pe-md-10 mb-10 mb-md-0">
                                        <div class="d-flex align-items-center collapsible py-3 toggle mb-0 collapsed" data-bs-toggle="collapse" :data-bs-target="'#kt_'+row.id" aria-expanded="false">
                                            <div class="btn btn-sm btn-icon mw-20px btn-active-color-primary me-5">
                                                <span class="svg-icon toggle-on svg-icon-primary svg-icon-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        <rect opacity="0.3" x="2" y="2" width="20" height="20" rx="5" fill="black"></rect>
                                                        <rect x="6.0104" y="10.9247" width="12" height="2" rx="1" fill="black"></rect>
                                                    </svg>
                                                </span>
                                                <span class="svg-icon toggle-off svg-icon-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        <rect opacity="0.3" x="2" y="2" width="20" height="20" rx="5" fill="black"></rect>
                                                        <rect x="10.8891" y="17.8033" width="12" height="2" rx="1" transform="rotate(-90 10.8891 17.8033)" fill="black"></rect>
                                                        <rect x="6.01041" y="10.9247" width="12" height="2" rx="1" fill="black"></rect>
                                                    </svg>
                                                </span>
                                            </div>
                                            <h4 class="text-gray-700 fw-bolder cursor-pointer mb-0">@{{ row.title }}</h4>
                                        </div>
                                    </div>
                                    <div class="col-md-2 mb-10 mb-md-0 mt-3">
                                        @include('admin_panel.includes.buttons.edit')
                                        @include('admin_panel.includes.buttons.delete')
                                    </div>
                                </div>
                                <div :id="'kt_'+row.id" class="fs-6 ms-1 collapse" style="">
                                    <div class="mb-4 text-gray-600 fw-bold fs-6 ps-10">@{{ row.details }}</div>
                                </div>
                                <div class="separator separator-dashed"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <page-limit v-if="page.totalItems>page.itemsPerPage" :meta="page"></page-limit>

                    <div class="col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end">
                        <div class="dataTables_paginate paging_simple_numbers">
                            @include('admin_panel.includes.paginate')
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </faqs-show>
@endsection
