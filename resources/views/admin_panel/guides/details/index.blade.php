@extends('admin_panel.layouts.app')

@push('page-title')
    {{$pageTitle}}
@endpush

@section('content')
    <guide-details :guide="{{ isset($guide) ? $guide : 'null'}}" inline-template>
        <div>
            <div class="card mb-5 mb-xl-10">
                <div class="card-body pt-9 pb-0">
                    <div class="d-flex flex-wrap flex-sm-nowrap mb-3">
                        <div class="me-7 mb-4">
                            <div class="symbol symbol-100px symbol-lg-160px symbol-fixed position-relative">
                                <img src="{{$guide->image_url}}" alt="image">
                            </div>
                        </div>
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between align-items-start flex-wrap mb-5">
                                <div class="d-flex flex-column">
                                    @if($guide->type == \App\Models\Guide::TYPE_PAID)
                                    <div class="d-flex flex-wrap fw-bold fs-6 pe-2">
                                        <div class="fs-2 fw-bolder counted" data-kt-countup="true" data-kt-countup-value="4500" data-kt-countup-prefix="$">{{$guide->show_unit_price}}</div>
                                    </div>
                                    @endif
                                    <div class="d-flex align-items-center mb-2">
                                        <a href="{{route_admin('guide.index',['id' => $guide->id])}}" class="text-gray-900 text-hover-primary fs-2 fw-bolder me-1">{{$guide->name}}</a>
                                    </div>
                                </div>
                                <div class="d-flex my-4">
                                    <a href="{{$guide->file_url}}" download class="btn btn-sm btn-light me-2">
                                         <span class="svg-icon svg-icon-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path opacity="0.3" d="M4.425 20.525C2.525 18.625 2.525 15.525 4.425 13.525L14.825 3.125C16.325 1.625 18.825 1.625 20.425 3.125C20.825 3.525 20.825 4.12502 20.425 4.52502C20.025 4.92502 19.425 4.92502 19.025 4.52502C18.225 3.72502 17.025 3.72502 16.225 4.52502L5.82499 14.925C4.62499 16.125 4.62499 17.925 5.82499 19.125C7.02499 20.325 8.82501 20.325 10.025 19.125L18.425 10.725C18.825 10.325 19.425 10.325 19.825 10.725C20.225 11.125 20.225 11.725 19.825 12.125L11.425 20.525C9.525 22.425 6.425 22.425 4.425 20.525Z" fill="black"></path>
                                                    <path d="M9.32499 15.625C8.12499 14.425 8.12499 12.625 9.32499 11.425L14.225 6.52498C14.625 6.12498 15.225 6.12498 15.625 6.52498C16.025 6.92498 16.025 7.525 15.625 7.925L10.725 12.8249C10.325 13.2249 10.325 13.8249 10.725 14.2249C11.125 14.6249 11.725 14.6249 12.125 14.2249L19.125 7.22493C19.525 6.82493 19.725 6.425 19.725 5.925C19.725 5.325 19.525 4.825 19.125 4.425C18.725 4.025 18.725 3.42498 19.125 3.02498C19.525 2.62498 20.125 2.62498 20.525 3.02498C21.325 3.82498 21.725 4.825 21.725 5.925C21.725 6.925 21.325 7.82498 20.525 8.52498L13.525 15.525C12.325 16.725 10.525 16.725 9.32499 15.625Z" fill="black"></path>
                                                </svg>
                                            </span>
                                        تحميل
                                    </a>
                                </div>
                            </div>

                            <div class="d-flex flex-wrap flex-stack mb-5">
                                <div class="d-flex flex-column flex-grow-1">
                                    <div class="d-flex flex-wrap">
                                        @if($guide->type == \App\Models\Guide::TYPE_PAID)
                                        <div class="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                            <div class="d-flex align-items-center">
                                                <div class="fs-2 fw-bolder counted" data-kt-countup="true" data-kt-countup-value="60" data-kt-countup-prefix="$">{{$guide->show_total_profits}}</div>
                                            </div>
                                            <div class="fw-bold fs-6 text-gray-400">إجمالي الأرباح</div>
                                        </div>
                                        @endif
                                        <div class="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                            <div class="d-flex align-items-center">
                                                <div class="fs-2 fw-bolder counted" data-kt-countup="true" data-kt-countup-value="4500">{{$guide->number_of_comments}}</div>
                                            </div>
                                            <div class="fw-bold fs-6 text-gray-400">عدد التعليقات</div>
                                        </div>
                                        <div class="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                            <div class="d-flex align-items-center">
                                                <div class="fs-2 fw-bolder counted" data-kt-countup="true" data-kt-countup-value="75">{{$guide->number_of_downloads}}</div>
                                            </div>
                                            <div class="fw-bold fs-6 text-gray-400">عدد التحميلات</div>
                                        </div>
                                        <div class="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                            <div class="d-flex align-items-center">
                                                <div class="fs-2 fw-bolder counted" data-kt-countup="true" data-kt-countup-value="75">{{$guide->number_of_likes}}</div>
                                            </div>
                                            <div class="fw-bold fs-6 text-gray-400">عدد الإعجابات</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="d-flex flex-wrap fw-bold fs-6 pe-2"><p>{!! $guide->details !!}</p></div>

                        </div>
                    </div>

                    <ul class="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bolder">
                        <li class="nav-item mt-2">
                            <a class="nav-link ms-0 me-10 py-5 text-active-primary active"
                               href="#comments"
                               data-bs-target="#comments"
                               data-kt-countup-tabs="true"
                               data-bs-toggle="tab"
                               @click="fetchComments">{{trans_admin('comments')}}</a>
                        </li>
                        <li class="nav-item mt-2">
                            <a class="nav-link ms-0 me-10 py-5"
                               href="#downloads"
                               data-bs-target="#downloads"
                               data-kt-countup-tabs="true"
                               data-bs-toggle="tab"
                               @click="fetchDownloads">{{trans_admin('downloads')}}</a>
                        </li>
                    </ul>
                </div>
            </div>


            <div class="card mb-5 mb-xl-10">
                <div class="tab-content">
                    <div id="comments" role="tabpanel" class="tab-pane fade active show">
                        <div class="card-header cursor-pointer">
                            <div class="card-title m-0">
                                <h3 class="fw-bolder m-0">{{trans_admin('comments')}}</h3>
                            </div>
                        </div>
                        <div class="card-body p-9">

                            <div class="dataTables_wrapper dt-bootstrap4 no-footer">
                                <div class="table-responsive">
                                    <table class="table table-row-bordered table-row-dashed gy-4 align-middle fw-bolder dataTable no-footer">
                                        <thead class="fs-7 text-gray-400 text-uppercase">
                                        <tr class="text-start text-muted fw-bolder fs-7 text-uppercase gs-0">
                                            <th>{{trans_admin('id')}}</th>
                                            <th>{{trans_admin('name')}}</th>
                                            <th>{{trans_admin('email')}}</th>
                                            <th>{{trans_admin('details')}}</th>
                                            <th>{{trans_admin('status')}}</th>
                                            <th>{{trans_admin('created_at')}}</th>
                                            <th>{{trans_admin('actions')}}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr v-if="comments.length > 0" v-for="row in comments">
                                            <td>@{{ row.id }}</td>
                                            <td>@{{ row.name }}</td>
                                            <td>@{{ row.email }}</td>
                                            <td>@{{ row.details }}</td>
                                            <td>
                                                <span v-if="row.status=={{YES}}" class="badge badge-light-success fw-bolder">@{{ row.show_status }}</span>
                                                <span v-if="row.status=={{NO}}" class="badge badge-light-danger fw-bolder">@{{ row.show_status }}</span>
                                                <span v-if="row.status=={{PENDING}}" class="badge badge-light-warning fw-bolder">@{{ row.show_status }}</span>
                                            </td>
                                            <td>@{{ row.created_at }}</td>
                                            <td>
                                                <label class="form-check form-switch form-check-custom form-check-solid">
                                                    <input type="checkbox" @click="changeStatus(row.id)" class="form-check-input" v-model="row.boolStatus">
                                                    <span class="form-check-label fw-bold text-muted"></span>
                                                </label>
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
                                    <page-limit v-if="page1.totalItems>page1.itemsPerPage"></page-limit>

                                    <div class="col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end">
                                        <div class="dataTables_paginate paging_simple_numbers">
                                            <paginate v-if="page1.totalItems>page1.itemsPerPage"
                                                      :click-handler="nextPage1"
                                                      ref="paginateTable"
                                                      :next-text="'>'"
                                                      :prev-text="'<'"
                                                      :page-count="page1.totalPages"
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
                    <div id="downloads" role="tabpanel" class="tab-pane fade">
                        <div class="card-header cursor-pointer">
                            <div class="card-title m-0">
                                <h3 class="fw-bolder m-0">{{trans_admin('downloads')}}</h3>
                            </div>
                        </div>
                        <div class="card-body p-9">
                            <div class="dataTables_wrapper dt-bootstrap4 no-footer">
                                <div class="table-responsive">
                                    <table class="table table-row-bordered table-row-dashed gy-4 align-middle fw-bolder dataTable no-footer">
                                        <thead class="fs-7 text-gray-400 text-uppercase">
                                        <tr class="text-start text-muted fw-bolder fs-7 text-uppercase gs-0">
                                            <th>{{trans_admin('id')}}</th>
                                            <th>{{trans_admin('order')}}</th>
                                            <th>{{trans_admin('user')}}</th>
                                            <th>{{trans_admin('created_at')}}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr v-if="downloads.length > 0" v-for="row in downloads">
                                            <td>@{{ row.id }}</td>
                                            <td><a :href=`${$admin_url}/orders/${row.order_id}/show` target="_blank">@{{ row.order_show_id }}</a></td>
                                            <td>@{{ row.user }}</td>
                                            <td>@{{ row.created_at }}</td>
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
                                    <page-limit v-if="page2.totalItems>page2.itemsPerPage"></page-limit>

                                    <div class="col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end">
                                        <div class="dataTables_paginate paging_simple_numbers">
                                            <paginate v-if="page2.totalItems>page2.itemsPerPage"
                                                      :click-handler="nextPage2"
                                                      ref="paginateTable"
                                                      :next-text="'>'"
                                                      :prev-text="'<'"
                                                      :page-count="page2.totalPages"
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
                </div>
            </div>
        </div>
    </guide-details>
@endsection
