@extends('admin_panel.layouts.app')

@push('page-title')
    {{$pageTitle}}
@endpush
@section('content')
    <careers-details :job="{{ isset($job) ? $job : 'null'}}" inline-template>
        <div class="card pt-4 mb-6 mb-xl-9">
            <div class="card-header border-0">
                <div class="card-title">
                    <h2>{{trans_admin('applicants_the_job')}} : {{$job->title}}</h2>
                </div>
            </div>
            <div class="card-body pt-0 pb-5">
                <div id="kt_table_customers_payment_wrapper" class="dataTables_wrapper dt-bootstrap4 no-footer">
                    <div class="table-responsive">
                        <table class="table align-middle table-row-dashed gy-5 dataTable no-footer" id="kt_table_customers_payment">
                            <thead class="border-bottom border-gray-200 fs-7 fw-bolder">
                            <tr class="text-start text-muted text-uppercase gs-0">
                                <th class="sorting" style="width: 50.6px;">ID</th>
                                <th class="min-w-100px sorting" style="width: 131.6px;">Full Name</th>
                                <th class="sorting" tabindex="0" style="width: 109.787px;">Email</th>
                                <th class="sorting" tabindex="0" style="width: 97.7px;">Mobile</th>
                                <th class="min-w-100px sorting" style="width: 207.038px;">Date</th>
                            </tr>
                            </thead>
                            <tbody class="fs-6 fw-bold text-gray-600">
                            <tr v-if="data.length > 0" v-for="row in data" class="odd">
                                <td>@{{ row.id }}</td>
                                <td>@{{ row.full_name }}</td>
                                <td>@{{ row.email }}</td>
                                <td>@{{ row.mobile }}</td>
                                <td>@{{ row.created_at }}</td>
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
    </careers-details>
@endsection
