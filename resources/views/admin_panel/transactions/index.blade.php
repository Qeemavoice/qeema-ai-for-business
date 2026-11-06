@extends('admin_panel.layouts.app')

@push('page-title')
    {{trans_admin('transactions')}}
@endpush

@section('content')
    <transactions-index inline-template>
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
                        <input type="text" data-kt-customer-table-filter="search" class="form-control form-control-solid w-250px ps-15" placeholder="{{trans_admin('search_transaction_id')}}" v-model="filter.searchText" @keyup="fetchData(route)">
                    </div>
                </div>
            </div>

            <div class="card-body pt-0">
                <div id="kt_customers_table_wrapper" class="dataTables_wrapper dt-bootstrap4 no-footer">
                    <div class="table-responsive">
                        <table class="table table-striped gy-7 gs-7">
                            <thead>
                            <tr class="fw-bold fs-6 text-gray-800 border-bottom border-gray-200">
{{--                                <th>{{trans_admin('order_id')}}</th>--}}
                                <th>{{trans_admin('transaction_id')}}</th>
                                <th>{{trans_admin('payer')}}</th>
                                <th>{{trans_admin('payee')}}</th>
                                <th>{{trans_admin('payment_method_id')}}</th>
                                <th>{{trans_admin('transaction_type')}}</th>
                                <th>{{trans_admin('amount_paid')}}</th>
                                <th>{{trans_admin('status')}}</th>
                                <th>{{trans_admin('created_at')}}</th>
                                <th>{{trans_admin('actions')}}</th>
                            </tr>
                            </thead>
                            <tbody>
                                <tr v-if="data.length > 0" v-for="row in data">
{{--                                    <td><a :href=`${$admin_url}/orders?id=${row.order_id}` target="_blank">@{{ row.order_show_id }}</a></td>--}}
                                    <td>@{{ row.transaction_id }}</td>
                                    <td>@{{ row.payer }}</td>
                                    <td>@{{ row.payee }}</td>
                                    <td>@{{ row.payment_method }}</td>
                                    <td><span class="badge badge-primary fw-bolder me-auto">@{{ row.transaction_type }}</span></td>
                                    <td>@{{ row.show_amount_paid }}</td>
                                    <td><transaction-status :status="row.transaction_status"></transaction-status></td>
                                    <td>@{{ row.created_at }}</td>
                                    <td>
                                        <a href="">الفاتورة</a>
                                        <a href="">الريسبونس</a>
                                    </td>
                                </tr>
                                <tr v-else>
                                    <td colspan="4">
                                        <h6 class="text-center" style="color: #a1a5b7">no data</h6>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="row">
                        <page-limit v-if="page.totalItems>page.itemsPerPage" :meta="page"></page-limit>

                        <div class="col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end">
                            <div class="dataTables_paginate paging_simple_numbers" id="kt_customers_table_paginate">

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
    </transactions-index>
@endsection
