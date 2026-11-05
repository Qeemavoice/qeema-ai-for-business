@extends('admin_panel.layouts.app')

@push('page-title')
    {{$pageTitle}}
@endpush

@section('content')
    <profits-show inline-template>
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
                        @include('admin_panel.includes.buttons.create',['label' => trans_admin('profit_transfer')])
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
                                <th>{{trans_admin('amount_paid')}}</th>
                                <th>{{trans_admin('withdrawal_method')}}</th>
                                <th>{{trans_admin('receipt')}}</th>
                                <th>{{trans_admin('created_at')}}</th>
{{--                                <th>{{trans_admin('actions')}}</th>--}}
                            </tr>
                            </thead>
                            <tbody>
                                <tr v-if="data.length > 0" v-for="(row,index) in data">
                                    <td>@{{ index + 1 }}</td>
                                    <td>@{{ row.id }}</td>
                                    <td>
                                        <div class="d-flex align-items-center" v-if="row.payee">
                                            <div class="me-5 position-relative">
                                                <div class="symbol symbol-35px symbol-circle">
                                                    <img alt="Pic" :src="row.payee.image_url">
                                                </div>
                                            </div>
                                            <div class="d-flex flex-column justify-content-center">
                                                <a href="" class="fs-6 text-gray-800 text-hover-primary">@{{ row.payee.full_name }}</a>
                                                <div class="fw-bold text-gray-400">@{{ row.payee.email }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>@{{ row.show_amount_paid }}</td>
                                    <td>@{{ row.withdrawal_method }}</td>
                                    <td>
                                        <a v-if="row.receipt_url" :href="row.receipt_url"  target="_blank">
                                            <span class="svg-icon svg-icon-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path opacity="0.3" d="M19 15C20.7 15 22 13.7 22 12C22 10.3 20.7 9 19 9C18.9 9 18.9 9 18.8 9C18.9 8.7 19 8.3 19 8C19 6.3 17.7 5 16 5C15.4 5 14.8 5.2 14.3 5.5C13.4 4 11.8 3 10 3C7.2 3 5 5.2 5 8C5 8.3 5 8.7 5.1 9H5C3.3 9 2 10.3 2 12C2 13.7 3.3 15 5 15H19Z" fill="black"></path>
                                                    <path d="M13 17.4V12C13 11.4 12.6 11 12 11C11.4 11 11 11.4 11 12V17.4H13Z" fill="black"></path>
                                                    <path opacity="0.3" d="M8 17.4H16L12.7 20.7C12.3 21.1 11.7 21.1 11.3 20.7L8 17.4Z" fill="black"></path>
                                                </svg>
                                            </span>
                                        </a>
                                        <span v-else>-</span>
                                    </td>
                                    <td>@{{ row.created_at }}</td>

{{--                                    <td>--}}
{{--                                        <a :href="route+'/'+row.id+'/details'" class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1">--}}
{{--                                            <span class="svg-icon svg-icon-3">--}}
{{--                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g class="nc-icon-wrapper" fill="#757575"><g id="Iconly/Broken/Paper" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><path d="M10.94 0c.02 0 .037.01.057.012h.206c.203 0 .398.084.54.233l5.049 5.312A.76.76 0 0 1 17 6.08v9.228C17 17.851 14.955 20 12.535 20H4.57C2.008 20 0 17.94 0 15.308v-2.523c0-.417.335-.755.748-.755.412 0 .747.338.747.755v2.523c0 1.784 1.351 3.182 3.075 3.182h7.965c1.582 0 2.97-1.487 2.97-3.182V6.383L11.688 2.37v1.316a1.83 1.83 0 0 0 1.815 1.837c.412.001.746.34.745.757a.751.751 0 0 1-.747.753c-1.825-.004-3.308-1.505-3.308-3.347V1.522H4.57c-1.667 0-3.075 1.374-3.075 3V8.68a.752.752 0 0 1-.747.755A.752.752 0 0 1 0 8.68V4.52C0 2.078 2.093.013 4.57.013h6.313C10.903.01 10.92 0 10.94 0zm-.188 12.895c.412 0 .747.338.747.755a.752.752 0 0 1-.747.755H5.37a.752.752 0 0 1-.748-.755c0-.417.335-.755.748-.755zM8.716 7.91c.413 0 .748.339.748.755a.752.752 0 0 1-.748.755H5.37a.752.752 0 0 1-.748-.755c0-.416.335-.755.748-.755z" id="Paper" transform="translate(3.5 2)" fill="#757575" fill-rule="nonzero"/></g></g></svg>--}}
{{--                                            </span>--}}
{{--                                        </a>--}}
{{--                                        <a :href="route+'/'+row.id+'/edit'" class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1">--}}
{{--                                            <span class="svg-icon svg-icon-3">--}}
{{--                                                <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">--}}
{{--                                                    <path d="M21.4 8.35303L19.241 10.511L13.485 4.755L15.643 2.59595C16.0248 2.21423 16.5426 1.99988 17.0825 1.99988C17.6224 1.99988 18.1402 2.21423 18.522 2.59595L21.4 5.474C21.7817 5.85581 21.9962 6.37355 21.9962 6.91345C21.9962 7.45335 21.7817 7.97122 21.4 8.35303ZM3.68699 21.932L9.88699 19.865L4.13099 14.109L2.06399 20.309C1.98815 20.5354 1.97703 20.7787 2.03189 21.0111C2.08674 21.2436 2.2054 21.4561 2.37449 21.6248C2.54359 21.7934 2.75641 21.9115 2.989 21.9658C3.22158 22.0201 3.4647 22.0084 3.69099 21.932H3.68699Z" fill="black" opacity="0.3"></path>--}}
{{--                                                    <path d="M5.574 21.3L3.692 21.928C3.46591 22.0032 3.22334 22.0141 2.99144 21.9594C2.75954 21.9046 2.54744 21.7864 2.3789 21.6179C2.21036 21.4495 2.09202 21.2375 2.03711 21.0056C1.9822 20.7737 1.99289 20.5312 2.06799 20.3051L2.696 18.422L5.574 21.3ZM4.13499 14.105L9.891 19.861L19.245 10.507L13.489 4.75098L4.13499 14.105Z" fill="black"></path>--}}
{{--                                                </svg>--}}
{{--                                            </span>--}}
{{--                                        </a>--}}
{{--                                        <a  @click="deleteRow(row.id,row.full_name)" class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm" href="javascript:;">--}}
{{--                                            <span class="svg-icon svg-icon-3">--}}
{{--                                                <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">--}}
{{--                                                    <path d="M5 9C5 8.44772 5.44772 8 6 8H18C18.5523 8 19 8.44772 19 9V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V9Z" fill="black"></path>--}}
{{--                                                    <path d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V5C19 5.55228 18.5523 6 18 6H6C5.44772 6 5 5.55228 5 5V5Z" fill="black" opacity="0.5"></path>--}}
{{--                                                    <path d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V4H9V4Z" fill="black" opacity="0.5"></path>--}}
{{--                                                </svg>--}}
{{--                                            </span>--}}
{{--                                        </a>--}}
{{--                                    </td>--}}

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
    </profits-show>
@endsection


