@extends('admin_panel.layouts.app')

@push('page-title')
    {{$pageTitle}}
@endpush

@section('content')
    <roles-show inline-template>
        <div>
            <div class="card" style="padding-bottom: 17px;">
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
            </div>
            <br>
            <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-5 g-xl-9">
                <div class="col-md-4" v-if="data.length > 0" v-for="row in data">
                    <div class="card h-md-100">
                        <div class="card-header">
                            <div class="card-title">
                                <h2>@{{ row.name }}</h2>
                            </div>
                        </div>
                        <div class="card-body pt-1">
                            <div class="d-flex flex-column text-gray-600">
                                <template v-if="row.permissions.length>0" v-for="(permission,i) in row.permissions" >
                                    <div v-if="i<5" class="d-flex align-items-center py-2">
                                        <span class="bullet bg-primary me-3"></span>
                                        @{{ permission.show_name }}
                                    </div>
                                </template>


                                <div v-if="row.permissions.length>5" class="d-flex align-items-center py-2">
                                    <span class="bullet bg-primary me-3 "></span>
                                    <em>and @{{ row.permissions.length - 5 }} more...</em>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer flex-wrap pt-0">
                            <a  :href="route+'/'+row.id+'/details'"  class="btn btn-light btn-active-primary my-1 me-2">{{trans_admin('view_role')}}</a>
                            <a :href="route+'/'+row.id+'/edit'" class="btn btn-light btn-active-light-primary my-1">{{trans_admin('edit_role')}}</a>
                        </div>
                    </div>
                </div>

                <div class="ol-md-4">
                    <div class="card h-md-100">
                        <div class="card-body d-flex flex-center">
                            <a href="{{route_admin('role.create')}}" class="btn btn-clear d-flex flex-column flex-center">
                                <img src="{{asset_admin('media/illustrations/sketchy-1/4.png')}}" alt="" class="mw-100 mh-150px mb-7">
                                <div class="fw-bolder fs-3 text-gray-600 text-hover-primary">{{trans_admin('add_new_role')}}</div>
                            </a>
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
    </roles-show>
@endsection
