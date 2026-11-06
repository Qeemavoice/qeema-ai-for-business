@extends('admin_panel.layouts.app')

@push('page-title')
    {{trans_admin('newsletter_subscribers')}}
@endpush

@section('content')

    <mailing-lists-show inline-template>
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
                        <input type="text" placeholder="{{trans_admin('email')}}" v-model="filter.searchText" @keyup="fetchData(route)"  class="form-control form-select-sm form-control-solid w-350px ps-14">
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
                                <th>{{trans_admin('id')}}</th>
                                <th>{{trans_admin('email')}}</th>
                                <th>{{trans_admin('created_at')}}</th>
                                <th>{{trans_admin('actions')}}</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-if="data.length > 0" v-for="row in data">
                                <td>@{{ row.id }}</td>
                                <td>@{{ row.email }}</td>
                                <td>@{{ row.created_at }}</td>
                                <td>
                                    <a @click="deleteRow(row.id,row.email)" class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm" href="javascript:;">
                                      <span class="svg-icon svg-icon-3">
                                          <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                                              <path d="M5 9C5 8.44772 5.44772 8 6 8H18C18.5523 8 19 8.44772 19 9V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V9Z" fill="black"></path>
                                              <path d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V5C19 5.55228 18.5523 6 18 6H6C5.44772 6 5 5.55228 5 5V5Z" fill="black" opacity="0.5"></path>
                                              <path d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V4H9V4Z" fill="black" opacity="0.5"></path>
                                          </svg>
                                      </span>
                                    </a>
                                </td>
                            </tr>
                            <tr v-else="">
                                <td colspan="10">
                                    <h6 class="text-center" style="color: #a1a5b7">No Data</h6>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="row">
                        <page-limit v-if="page.totalItems>page.itemsPerPage"></page-limit>

                        <div class="col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end">
                            <div class="dataTables_paginate paging_simple_numbers">
                                @include('admin_panel.includes.paginate')
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </mailing-lists-show>
@endsection
