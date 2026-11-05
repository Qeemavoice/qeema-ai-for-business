@extends('admin_panel.layouts.app')

@push('page-title')
    {{$pageTitle}}
@endpush

@section('content')
    <clients-show :id="{{request()->has('id') ? request()->get('id') : 'null'}}" inline-template>
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
                        <input type="text" placeholder="{{trans_admin('search_full_name_email')}}" v-model="filter.searchText" @keyup="fetchData(route)"  class="form-control form-select-sm form-control-solid w-350px ps-14">
                    </div>
                </div>
                <div class="card-toolbar">
                </div>
            </div>

            <div class="card-body pt-0">
                <div id="kt_customers_table_wrapper" class="dataTables_wrapper dt-bootstrap4 no-footer">
                    <div class="table-responsive">
                        <table class="table table-row-bordered table-row-dashed gy-4 align-middle fw-bolder dataTable no-footer">
                            <thead class="fs-7 text-gray-400 text-uppercase">
                            <tr class="text-start text-muted fw-bolder fs-7 text-uppercase gs-0">
                                <th>#</th>
                                <th>{{trans_admin('id')}}</th>
                                <th>{{trans_admin('full_name')}}</th>
                                <th>{{trans_admin('country')}}</th>
                                <th>{{trans_admin('work_domain')}}</th>
                                <th>{{trans_admin('number_of_in_progress_reservations')}}</th>
                                <th>{{trans_admin('number_of_completed_reservations')}}</th>
                                <th>{{trans_admin('total_payment')}}</th>
                                <th>{{trans_admin('joined_date')}}</th>
                                <th>{{trans_admin('actions')}}</th>
                            </tr>
                            </thead>
                            <tbody>
                                <tr v-if="data.length > 0" v-for="(row,index) in data">
                                    <td>@{{ index + 1 }}</td>
                                    <td>@{{ row.id }}</td>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <div v-if="row.image_url" class="me-5 position-relative">
                                                <div class="symbol symbol-35px symbol-circle">
                                                    <img alt="Pic" :src="row.image_url">
                                                </div>
                                            </div>
                                            <div class="d-flex flex-column justify-content-center">
                                                <a href="" class="fs-6 text-gray-800 text-hover-primary">@{{ row.show_full_name }}</a>
                                                <div class="fw-bold text-gray-400">@{{ row.email }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>@{{ row.country }}</td>
                                    <td>
                                        <ul v-if="row.work_fields.length>0">
                                            <li v-for="work_field in row.work_fields">@{{ work_field }}  </li>
                                        </ul>
                                    </td>
                                    <td>@{{ row.in_progress_orders_customer_count }}</td>
                                    <td>@{{ row.number_of_completed_reservations }}</td>
                                    <td>@{{ row.total_payment }}</td>
                                    <td><div class="badge badge-light-success fw-bolder">@{{ row.show_last_login }}</div></td>

                                    <td>
                                        @include('admin_panel.includes.buttons.details')
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
    </clients-show>
@endsection
