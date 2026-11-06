@extends('admin_panel.layouts.app')

@push('page-title')
    {{$pageTitle}}
@endpush

@section('content')
    <admins-show inline-template>
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
{{--                    <button class="btn btn-sm btn-light-primary me-3" data-kt-menu-trigger="click" type="button" @click="showAdvancedFilter">--}}
{{--                        <span class="svg-icon svg-icon-2">--}}
{{--                            <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">--}}
{{--                                <path d="M19.0759 3H4.72777C3.95892 3 3.47768 3.83148 3.86067 4.49814L8.56967 12.6949C9.17923 13.7559 9.5 14.9582 9.5 16.1819V19.5072C9.5 20.2189 10.2223 20.7028 10.8805 20.432L13.8805 19.1977C14.2553 19.0435 14.5 18.6783 14.5 18.273V13.8372C14.5 12.8089 14.8171 11.8056 15.408 10.964L19.8943 4.57465C20.3596 3.912 19.8856 3 19.0759 3Z" fill="black"/>--}}
{{--                            </svg>--}}
{{--                        </span>--}}
{{--                        {{trans_admin('filter')}}--}}
{{--                    </button>--}}

{{--                    <a :href="route+'/export?filter='+JSON.stringify(filter)" class="btn btn-sm btn-light-primary me-3 color-btn-export">--}}
{{--                        <span class="svg-icon svg-icon-2">--}}
{{--                            <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">--}}
{{--                                <rect fill="black" height="2" opacity="0.3" rx="1" transform="rotate(90 12.75 4.25)" width="12" x="12.75" y="4.25"/>--}}
{{--                                <path d="M12.0573 6.11875L13.5203 7.87435C13.9121 8.34457 14.6232 8.37683 15.056 7.94401C15.4457 7.5543 15.4641 6.92836 15.0979 6.51643L12.4974 3.59084C12.0996 3.14332 11.4004 3.14332 11.0026 3.59084L8.40206 6.51643C8.0359 6.92836 8.0543 7.5543 8.44401 7.94401C8.87683 8.37683 9.58785 8.34458 9.9797 7.87435L11.4427 6.11875C11.6026 5.92684 11.8974 5.92684 12.0573 6.11875Z" fill="black"/>--}}
{{--                                <path d="M18.75 8.25H17.75C17.1977 8.25 16.75 8.69772 16.75 9.25C16.75 9.80228 17.1977 10.25 17.75 10.25C18.3023 10.25 18.75 10.6977 18.75 11.25V18.25C18.75 18.8023 18.3023 19.25 17.75 19.25H5.75C5.19772 19.25 4.75 18.8023 4.75 18.25V11.25C4.75 10.6977 5.19771 10.25 5.75 10.25C6.30229 10.25 6.75 9.80228 6.75 9.25C6.75 8.69772 6.30229 8.25 5.75 8.25H4.75C3.64543 8.25 2.75 9.14543 2.75 10.25V19.25C2.75 20.3546 3.64543 21.25 4.75 21.25H18.75C19.8546 21.25 20.75 20.3546 20.75 19.25V10.25C20.75 9.14543 19.8546 8.25 18.75 8.25Z" fill="#C4C4C4"/>--}}
{{--                            </svg>--}}
{{--                        </span>--}}
{{--                        {{trans_admin('export')}}--}}
{{--                    </a>--}}

                    @can('create-admin')
                        @include('admin_panel.includes.buttons.create')
                    @endcan
                </div>
            </div>

            <div class="card-body pt-0">
                <div id="kt_customers_table_wrapper" class="dataTables_wrapper dt-bootstrap4 no-footer">
                    <div class="table-responsive">
                        <table class="table table-row-bordered table-row-dashed gy-4 align-middle fw-bolder dataTable no-footer">
                            <thead class="fs-7 text-gray-400 text-uppercase">
                            <tr class="text-start text-muted fw-bolder fs-7 text-uppercase gs-0">
                                <th>{{trans_admin('id')}}</th>
                                <th>{{trans_admin('full_name')}}</th>
                                <th>{{trans_admin('role')}}</th>
                                <th>{{trans_admin('last_login')}}</th>
                                <th>{{trans_admin('joined_date')}}</th>
                                @canany(['edit-admin', 'delete-admin'])
                                <th>{{trans_admin('actions')}}</th>
                                @endcanany
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
                                                <a href="" class="fs-6 text-gray-800 text-hover-primary">@{{ row.full_name }}</a>
                                                <div class="fw-bold text-gray-400">@{{ row.email }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span class="badge badge-light fw-bolder me-auto px-4 py-3">@{{ row.role }}</span></td>
                                    <td><div class="badge badge-light-success fw-bolder">@{{ row.show_last_login }}</div></td>
                                    <td>@{{ row.created_at }}</td>
                                    @canany(['edit-admin', 'delete-admin'])
                                    <td>
                                        <a :href="route+'/'+row.id+'/details'" class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1">
                                            <span class="svg-icon svg-icon-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g class="nc-icon-wrapper" fill="#757575"><g id="Iconly/Broken/Paper" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><path d="M10.94 0c.02 0 .037.01.057.012h.206c.203 0 .398.084.54.233l5.049 5.312A.76.76 0 0 1 17 6.08v9.228C17 17.851 14.955 20 12.535 20H4.57C2.008 20 0 17.94 0 15.308v-2.523c0-.417.335-.755.748-.755.412 0 .747.338.747.755v2.523c0 1.784 1.351 3.182 3.075 3.182h7.965c1.582 0 2.97-1.487 2.97-3.182V6.383L11.688 2.37v1.316a1.83 1.83 0 0 0 1.815 1.837c.412.001.746.34.745.757a.751.751 0 0 1-.747.753c-1.825-.004-3.308-1.505-3.308-3.347V1.522H4.57c-1.667 0-3.075 1.374-3.075 3V8.68a.752.752 0 0 1-.747.755A.752.752 0 0 1 0 8.68V4.52C0 2.078 2.093.013 4.57.013h6.313C10.903.01 10.92 0 10.94 0zm-.188 12.895c.412 0 .747.338.747.755a.752.752 0 0 1-.747.755H5.37a.752.752 0 0 1-.748-.755c0-.417.335-.755.748-.755zM8.716 7.91c.413 0 .748.339.748.755a.752.752 0 0 1-.748.755H5.37a.752.752 0 0 1-.748-.755c0-.416.335-.755.748-.755z" id="Paper" transform="translate(3.5 2)" fill="#757575" fill-rule="nonzero"/></g></g></svg>
                                            </span>
                                        </a>
                                        <a :href="route+'/'+row.id+'/edit'" class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1">
                                            <span class="svg-icon svg-icon-3">
                                                <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M21.4 8.35303L19.241 10.511L13.485 4.755L15.643 2.59595C16.0248 2.21423 16.5426 1.99988 17.0825 1.99988C17.6224 1.99988 18.1402 2.21423 18.522 2.59595L21.4 5.474C21.7817 5.85581 21.9962 6.37355 21.9962 6.91345C21.9962 7.45335 21.7817 7.97122 21.4 8.35303ZM3.68699 21.932L9.88699 19.865L4.13099 14.109L2.06399 20.309C1.98815 20.5354 1.97703 20.7787 2.03189 21.0111C2.08674 21.2436 2.2054 21.4561 2.37449 21.6248C2.54359 21.7934 2.75641 21.9115 2.989 21.9658C3.22158 22.0201 3.4647 22.0084 3.69099 21.932H3.68699Z" fill="black" opacity="0.3"></path>
                                                    <path d="M5.574 21.3L3.692 21.928C3.46591 22.0032 3.22334 22.0141 2.99144 21.9594C2.75954 21.9046 2.54744 21.7864 2.3789 21.6179C2.21036 21.4495 2.09202 21.2375 2.03711 21.0056C1.9822 20.7737 1.99289 20.5312 2.06799 20.3051L2.696 18.422L5.574 21.3ZM4.13499 14.105L9.891 19.861L19.245 10.507L13.489 4.75098L4.13499 14.105Z" fill="black"></path>
                                                </svg>
                                            </span>
                                        </a>
                                        <a v-if="row.id !== 1" @click="deleteRow(row.id,row.full_name)" class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm" href="javascript:;">
                                            <span class="svg-icon svg-icon-3">
                                                <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M5 9C5 8.44772 5.44772 8 6 8H18C18.5523 8 19 8.44772 19 9V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V9Z" fill="black"></path>
                                                    <path d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V5C19 5.55228 18.5523 6 18 6H6C5.44772 6 5 5.55228 5 5V5Z" fill="black" opacity="0.5"></path>
                                                    <path d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V4H9V4Z" fill="black" opacity="0.5"></path>
                                                </svg>
                                            </span>
                                        </a>
                                    </td>
                                    @endcanany
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
    </admins-show>
@endsection


