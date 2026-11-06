<div class="tab-pane fade" id="form_answers" role="tab-panel">
    <div class="d-flex flex-column gap-7 gap-lg-10">

        <div class="d-flex flex-column gap-7 gap-lg-10">
            <div class="card">
                <div class="card-body pt-0">
                    <div id="kt_customers_table_wrapper" class="dataTables_wrapper dt-bootstrap4 no-footer">
                        <div class="table-responsive">
                            <table class="table table-striped gy-7 gs-7">
                                <thead>
                                <tr class="fw-bold fs-6 text-gray-800 border-bottom border-gray-200">
                                    <th>{{trans_admin('question')}}</th>
                                    <th>{{trans_admin('answer')}}</th>
                                    <th>{{trans_admin('created_at')}}</th>
                                    <th>{{trans_admin('actions')}}</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-if="answers.length>0" v-for="(answer,index) in answers">
                                    <td>@{{ answer.form_field }}</td>
                                    <td>@{{ answer.answer }}</td>
                                    <td>@{{ answer.created_at }}</td>
                                    <td></td>
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
                            <page-limit v-if="pageAnswers.totalItems>limit"></page-limit>

                            <div class="col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end">
                                <div class="dataTables_paginate paging_simple_numbers" id="kt_customers_table_paginate">

                                    <paginate v-if="pageAnswers.totalItems>limit"
                                              :click-handler="pageAnswers"
                                              ref="paginateTable"
                                              :next-text="'>'"
                                              :prev-text="'<'"
                                              :page-count="pageAnswers.totalPages"
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
