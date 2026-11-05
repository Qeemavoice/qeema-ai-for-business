@extends('admin_panel.layouts.app')

@push('page-title')
    {{$pageTitle}}
@endpush

@section('content')

    <role-details :role="{{ isset($role) ? $role : 'null'}}" inline-template>
        <div class="d-flex flex-column flex-lg-row">
            <div class="flex-column flex-lg-row-auto w-100 w-lg-200px w-xl-300px mb-10">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <h2 class="mb-0">{{$role->name}}</h2>
                        </div>
                    </div>

                    <div class="card-body">
                        <div class="d-flex flex-column text-gray-600">
                            @isset($role->permissions)
                                @foreach($role->permissions as $i => $permission)
                                   @if($i < 5)
                                    <div class="d-flex align-items-center py-2">
                                        <span class="bullet bg-primary me-3"></span>
                                        {{$permission->show_name}}
                                    </div>
                                    @endif
                                @endforeach

                                @if($i > 5)
                                    <div class="d-flex align-items-center py-2">
                                        <span class="bullet bg-primary me-3 "></span>
                                        <em>{{trans_admin('and')}} {{ count($role->permissions) - 5 }} {{trans_admin('more')}}</em>
                                    </div>
                                @endif
                            @endisset
                        </div>
                    </div>
                    <div class="card-footer pt-0">
                        <a href="{{route_admin('role.edit',['id' => $role->id])}}" class="btn btn-light btn-active-primary">{{trans_admin('edit_role')}}</a>
                    </div>
                </div>
            </div>

            <div class="flex-lg-row-fluid ms-lg-10">
                <div class="card mb-6 mb-xl-9">
                    <div class="card-header pt-5">
                        <div class="card-title">
                            <h2 class="d-flex align-items-center">{{trans_admin('users_assigned')}}
                                <span class="text-gray-600 fs-6 ms-1">(@{{ data.length }})</span>
                            </h2>
                        </div>
                        <div class="card-toolbar">
                            <div  v-if="data.length>0" class="d-flex align-items-center position-relative my-1">
                                <span class="svg-icon svg-icon-1 position-absolute ms-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <rect opacity="0.5" x="17.0365" y="15.1223" width="8.15546" height="2" rx="1" transform="rotate(45 17.0365 15.1223)" fill="black" />
                                        <path d="M11 19C6.55556 19 3 15.4444 3 11C3 6.55556 6.55556 3 11 3C15.4444 3 19 6.55556 19 11C19 15.4444 15.4444 19 11 19ZM11 5C7.53333 5 5 7.53333 5 11C5 14.4667 7.53333 17 11 17C14.4667 17 17 14.4667 17 11C17 7.53333 14.4667 5 11 5Z" fill="black" />
                                    </svg>
                                </span>
                                <input type="text" v-model="filter.searchText" @keyup="fetchData"  class="form-control form-control-solid w-250px ps-15" placeholder="{{trans_admin('search_users')}}" />
                            </div>
{{--                            <div class="d-flex justify-content-end align-items-center d-none" data-kt-view-roles-table-toolbar="selected">--}}
{{--                                <div class="fw-bolder me-5">--}}
{{--                                    <span class="me-2" data-kt-view-roles-table-select="selected_count"></span>Selected</div>--}}
{{--                                <button type="button" class="btn btn-danger" data-kt-view-roles-table-select="delete_selected">Delete Selected</button>--}}
{{--                            </div>--}}
                        </div>
                    </div>
                    <div class="card-body pt-0">
                        <table class="table align-middle table-row-dashed fs-6 gy-5 mb-0" id="kt_roles_view_table">
                            <thead>
                            <tr class="text-start text-muted fw-bolder fs-7 text-uppercase gs-0">
{{--                                <th class="w-10px pe-2">--}}
{{--                                    <div class="form-check form-check-sm form-check-custom form-check-solid me-3">--}}
{{--                                        <input class="form-check-input" type="checkbox" value="1" />--}}
{{--                                    </div>--}}
{{--                                </th>--}}
                                <th class="min-w-50px">{{trans_admin('id')}}</th>
                                <th class="min-w-150px">{{trans_admin('user')}}</th>
                                <th class="min-w-125px">{{trans_admin('joined_date')}}</th>
                                <th class="text-end min-w-100px">{{trans_admin('actions')}}</th>
                            </tr>
                            </thead>
                            <tbody class="fw-bold text-gray-600">
                            <tr v-for="row in data" v-if="data.length>0" >
{{--                                <td>--}}
{{--                                    <div class="form-check form-check-sm form-check-custom form-check-solid">--}}
{{--                                        <input class="form-check-input" type="checkbox" value="1" />--}}
{{--                                    </div>--}}
{{--                                </td>--}}
                                <td>@{{ row.id }}</td>
                                <td class="d-flex align-items-center">
                                    <div class="symbol symbol-circle symbol-50px overflow-hidden me-3">
                                        <a href="">
                                            <div class="symbol-label">
                                                <img :src="row.image_url" alt="Emma Smith" class="w-100" />
                                            </div>
                                        </a>
                                    </div>
                                    <div class="d-flex flex-column">
                                        <a href="" class="text-gray-800 text-hover-primary mb-1">@{{ row.full_name }}</a>
                                        <span>@{{ row.email }}</span>
                                    </div>
                                </td>
                                <td>@{{ row.format1_created_at }}</td>
                                <td class="text-end">
{{--                                    <a :href="route+'/'+row.id+'/view'" class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1">--}}
{{--                                        <span class="svg-icon svg-icon-3">--}}
{{--                                            <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">--}}
{{--                                                <path d="M21.4 8.35303L19.241 10.511L13.485 4.755L15.643 2.59595C16.0248 2.21423 16.5426 1.99988 17.0825 1.99988C17.6224 1.99988 18.1402 2.21423 18.522 2.59595L21.4 5.474C21.7817 5.85581 21.9962 6.37355 21.9962 6.91345C21.9962 7.45335 21.7817 7.97122 21.4 8.35303ZM3.68699 21.932L9.88699 19.865L4.13099 14.109L2.06399 20.309C1.98815 20.5354 1.97703 20.7787 2.03189 21.0111C2.08674 21.2436 2.2054 21.4561 2.37449 21.6248C2.54359 21.7934 2.75641 21.9115 2.989 21.9658C3.22158 22.0201 3.4647 22.0084 3.69099 21.932H3.68699Z" fill="black" opacity="0.3"></path>--}}
{{--                                                <path d="M5.574 21.3L3.692 21.928C3.46591 22.0032 3.22334 22.0141 2.99144 21.9594C2.75954 21.9046 2.54744 21.7864 2.3789 21.6179C2.21036 21.4495 2.09202 21.2375 2.03711 21.0056C1.9822 20.7737 1.99289 20.5312 2.06799 20.3051L2.696 18.422L5.574 21.3ZM4.13499 14.105L9.891 19.861L19.245 10.507L13.489 4.75098L4.13499 14.105Z" fill="black"></path>--}}
{{--                                            </svg>--}}
{{--                                        </span>--}}
{{--                                    </a>--}}
                                    <a @click="deleteRow(row.id,row.full_name)" class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm" href="javascript:;">
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
                            <tr v-else>
                                <td class="text-end" colspan="10">
                                    <h6 class="text-center" style="color: #a1a5b7">{{trans_admin('no_data')}}</h6>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </role-details>
@endsection
