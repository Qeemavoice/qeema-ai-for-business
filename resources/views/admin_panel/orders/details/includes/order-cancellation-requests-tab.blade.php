<div class="tab-pane fade" id="orders_cancellation_requests" role="tab-panel">
    <div class="d-flex flex-column gap-7 gap-lg-10">
        <div class="card">
            <div class="card-body pt-0">
                <div id="kt_customers_table_wrapper" class="dataTables_wrapper dt-bootstrap4 no-footer">
                    <div class="table-responsive">
                        <table class="table table-row-bordered table-row-dashed gy-4 align-middle fw-bolder dataTable no-footer">
                            <thead class="fs-7 text-gray-400 text-uppercase">
                            <tr class="text-start text-muted fw-bolder fs-7 text-uppercase gs-0">
                                <th>{{trans_admin('order')}}</th>
                                <th>{{trans_admin('from')}}</th>
                                <th>{{trans_admin('reasons')}}</th>
                                <th>{{trans_admin('status')}}</th>
                                <th>{{trans_admin('created_at')}}</th>
                                @can('show-orders')
                                    <th>{{trans_admin('actions')}}</th>
                                @endcan
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-if="ordersCancellation.length > 0" v-for="row in ordersCancellation">
                                <td><a href="#" target="_blank">@{{ row.order_show_id }}</a></td>
                                <td>@{{ row.from }}</td>
                                <td>@{{ row.reasons }}</td>
                                <td><order-status :status="row.request_status"></order-status></td>
                                <td>@{{ row.created_at }}</td>
                                <td>
                                    <template v-if="row.request_status.id=={{\App\Models\RequestStatus::PENDING}}">
                                        <a href="javascript:;" @click="accept(row.id,row.order_show_id)" class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1">
                                            <span class="svg-icon svg-icon-3"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><polygon points="0 0 24 0 24 24 0 24"/><path d="M6.26193932,17.6476484 C5.90425297,18.0684559 5.27315905,18.1196257 4.85235158,17.7619393 C4.43154411,17.404253 4.38037434,16.773159 4.73806068,16.3523516 L13.2380607,6.35235158 C13.6013618,5.92493855 14.2451015,5.87991302 14.6643638,6.25259068 L19.1643638,10.2525907 C19.5771466,10.6195087 19.6143273,11.2515811 19.2474093,11.6643638 C18.8804913,12.0771466 18.2484189,12.1143273 17.8356362,11.7474093 L14.0997854,8.42665306 L6.26193932,17.6476484 Z" fill="#000000" fill-rule="nonzero" transform="translate(11.999995, 12.000002) rotate(-180.000000) translate(-11.999995, -12.000002) "/></g></svg></span>
                                        </a>
                                        <a href="javascript:;" @click="reject(row.id,row.order_show_id)" class="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1">
                                            <span class="svg-icon svg-icon-3"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(12.000000, 12.000000) rotate(-45.000000) translate(-12.000000, -12.000000) translate(4.000000, 4.000000)" fill="#000000"><rect x="0" y="7" width="16" height="2" rx="1"/><rect opacity="0.3" transform="translate(8.000000, 8.000000) rotate(-270.000000) translate(-8.000000, -8.000000) " x="0" y="7" width="16" height="2" rx="1"/></g></g></svg></span>
                                        </a>
                                    </template>
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
                        <page-limit v-if="pageOrdersCancellation.totalItems>pageOrdersCancellation.itemsPerPage"></page-limit>

                        <div class="col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end">
                            <div class="dataTables_paginate paging_simple_numbers">
                                <paginate v-if="pageOrdersCancellation.totalItems>limit"
                                          :click-handler="nextPageOrdersCancellation"
                                          ref="paginateTable"
                                          :next-text="'>'"
                                          :prev-text="'<'"
                                          :page-count="pageTransactions.totalPages"
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
