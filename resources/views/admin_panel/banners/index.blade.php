@extends('admin_panel.layouts.app')

@push('page-title')
    {{$pageTitle}}
@endpush

@section('content')
    <banners-show inline-template>
        <div class="card">
            <div class="card-header border-0 pt-6" data-select2-id="select2-data-80-1718">
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
            <div class="card-body pt-0">
                <div class="dataTables_wrapper dt-bootstrap4 no-footer">
                    <div class="table-responsive">
                        <table class="table table-row-bordered table-row-dashed gy-4 align-middle fw-bolder dataTable no-footer">
                            <thead class="fs-7 text-gray-400 text-uppercase">
                            <tr class="text-start text-muted fw-bolder fs-7 text-uppercase gs-0">
                                <th>{{trans_admin('id')}}</th>
                                <th>{{trans_admin('title')}}</th>
                                <th>{{trans_admin('page_show')}}</th>
                                <th>{{trans_admin('position')}}</th>
                                <th>{{trans_admin('created_at')}}</th>
                                <th>{{trans_admin('actions')}}</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-if="data.length > 0" v-for="row in data">
                                <td>@{{ row.id }}</td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="me-5 position-relative">
                                            <div class="symbol symbol-35px symbol-circle">
                                                <img alt="Pic" :src="row.image_url">
                                            </div>
                                        </div>
                                        <div class="d-flex flex-column justify-content-center">
                                            <span class="fs-6 text-gray-800 text-hover-primary">@{{ row.title }}</span>
                                        </div>
                                    </div>
                                </td>
                                <td><span class="badge badge-light fw-bolder me-auto px-4 py-3">@{{ row.page_show }}</span></td>
                                <td><span class="badge badge-light-primary fw-bolder me-auto px-4 py-3">@{{ row.position }}</span></td>
                                <td>@{{ row.created_at }}</td>
                                <td>
                                    @include('admin_panel.includes.buttons.edit')
                                    @include('admin_panel.includes.buttons.delete')
                                </td>
                            </tr>
                            <tr v-else>
                                <td colspan="10">
                                    <h6 class="text-center" style="color: #a1a5b7">No Data</h6>
                                </td>
                            </tr>
                            </tbody>
                        </table>
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
        </div>
    </banners-show>
@endsection
