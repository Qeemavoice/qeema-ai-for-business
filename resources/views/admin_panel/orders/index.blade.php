@extends('admin_panel.layouts.app')

@push('page-title')
    {{trans_admin('orders')}}
@endpush

@section('content')
    <orders-index :id="{{request()->has('id') ? request()->get('id') : 'null'}}" inline-template>
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
                        <input type="text" data-kt-customer-table-filter="search" class="form-control form-control-solid w-250px ps-15" placeholder="{{trans_admin('search_name_email')}}" v-model="filter.searchText" @keyup="fetchData(route)">
                    </div>

                </div>
            </div>

            <div class="card-body pt-0">
                <div id="kt_customers_table_wrapper" class="dataTables_wrapper dt-bootstrap4 no-footer">
                    <div class="table-responsive">
                        <table class="table table-striped gy-7 gs-7">
                            <thead>
                            <tr class="fw-bold fs-6 text-gray-800 border-bottom border-gray-200">
                                <th>#</th>
                                <th>{{trans_admin('id')}}</th>
                                <th>{{trans_admin('name')}}</th>
                                <th>{{trans_admin('email')}}</th>
                                <th>{{trans_admin('status')}}</th>
                                <th>{{trans_admin('type')}}</th>
                                <th>{{trans_admin('total')}}</th>
                                <th>{{trans_admin('created_at')}}</th>
                                @can('show-orders')
                                <th>{{trans_admin('actions')}}</th>
                                @endcan
                            </tr>
                            </thead>
                            <tbody>
                                <tr v-if="data.length > 0" v-for="(row,index) in data">
                                    <td>@{{ index + 1 }}</td>
                                    <td>@{{ row.order_show_id }}</td>
                                    <td><a :href=`${$admin_url}/clients?id=${row.customer_id}` target="_blank">@{{ row.customer_name }}</a> </td>
                                    <td>@{{ row.customer_email }}</td>
                                    <td><order-status :status="row.status"></order-status></td>
                                    <td><order-type :type="row.type"></order-type></td>
                                    <td>@{{ row.total }}</td>
                                    <td>@{{ row.created_at }}</td>
                                    <td>
                                        @include('admin_panel.includes.buttons.details')
                                    </td>
                                </tr>
                                <tr v-else>
                                    <td colspan="7">
                                        <h6 class="text-center" style="color: #a1a5b7">no data</h6>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="row">
                        <page-limit v-if="page.totalItems>page.itemsPerPage" :meta="page"></page-limit>
                        <div class="col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end">
                            <div class="dataTables_paginate paging_simple_numbers">
                                <paginate v-if="page.totalItems>limit"
                                          :click-handler="nextPage"
                                          ref="paginateTable"
                                          :next-text="'>'"
                                          :prev-text="'<'"
                                          :page-count="page.totalPages"
                                          :container-class="'pagination'"
                                          :next-class="'paginate_button page-item next'"
                                          :prev-class="'paginate_button page-item previous'"
                                          :next-link-class="'page-link'"
                                          :prev-link-class="'page-link'"
                                          :page-class="'paginate_button page-item'"
                                          :page-link-class="'page-link'">
                                </paginate>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </orders-index>
@endsection
