@extends('admin_panel.layouts.app')

@push('page-title')
    {{$pageTitle}}
@endpush

@section('content')
    <languages-show inline-template>
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
                                <th>{{trans_admin('name')}}</th>
                                <th>{{trans_admin('code')}}</th>
                                <th>{{trans_admin('created_at')}}</th>
                                <th>{{trans_admin('actions')}}</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-if="data.length > 0" v-for="row in data">
                                <td>@{{ row.id }}</td>
                                <td>@{{ row.name }}</td>
                                <td>@{{ row.code }}</td>
                                <td>@{{ row.created_at }}</td>
                                <td>
                                    @include('admin_panel.includes.buttons.edit')
                                    @include('admin_panel.includes.buttons.delete')
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
    </languages-show>
@endsection
