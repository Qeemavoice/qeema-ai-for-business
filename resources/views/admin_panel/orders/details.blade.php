@extends('admin_panel.layouts.app')

@push('page-title')
    {{trans_admin('orders')}}
@endpush

@section('content')
    <order-details-index :order="{{isset($order)?$order->toJson() : 'null'}}" inline-template>
        <div class="card">
            <div class="card-header border-0 pt-6" data-select2-id="select2-data-80-1718">
                <div class="card-title"><div class="d-flex align-items-center position-relative my-1">{{trans_admin('order_details')}}</div></div>
            </div>
            <div class="card-body pt-0">
                <div id="kt_customers_table_wrapper" class="dataTables_wrapper dt-bootstrap4 no-footer">
                    <div class="m-section__content">
                        <div class="row">
                            <div class="col-md-6">
                                <h5 class="mb-4">Order Information</h5>
                                <table style="width: 100%;">
                                    <tbody>
                                    <tr>
                                        <td>Order Date</td>
                                        <td>@{{ order.created_at }}</td>
                                    </tr>
                                    <tr>
                                        <td>Order Status</td>
                                        <td>
                                            <select class="form-control" v-model="status" @change="changeStatus">
                                                @foreach($orderStatuses as $status)
                                                    <option value="{{$status->id}}">{{$status->name}}</option>
                                                @endforeach
                                            </select>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="col-md-6"><h5 class="mb-4">Account Information</h5>
                                <table style="width: 100%;">
                                    <tbody>
                                    <tr>
                                        <td>Customer Name</td>
                                        <td>@{{ order.customer_full_name }}</td>
                                    </tr>
                                    <tr>
                                        <td>Customer Email</td>
                                        <td>@{{ order.customer_email }}</td>
                                    </tr>
                                    <tr>
                                        <td>Customer phone</td>
                                        <td>@{{ order.customer_phone }}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <hr>
                        <div class="row">
                            <div class="col-md-6"><h5 class="mb-4">Transaction Details </h5>
                                <table style="width: 100%;">
                                    <tbody>
                                    <tr>
                                        <td>Payment Method</td>
                                        <td>@{{ order.show_payment_method }}</td>
                                    </tr>
                                    <tr>
                                        <td>Transaction ID</td>
                                        <td>@{{ order.transaction.transaction_id }}</td>
                                    </tr>
                                    <tr>
                                        <td>Status</td>
                                        <td>@{{ order.transaction.status }}</td>
                                    </tr>
                                    <tr>
                                        <td>Currency</td>
                                        <td>@{{ order.transaction.currency }}</td>
                                    </tr>
                                    <tr>
                                        <td>Response</td>
                                        <td>
                                            <a href="javascritp:;" @click="showResponseTransactionModal">Show</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <hr>
                        <div class="row">
                            <div class="col-md-12"><h5 class="mb-4">Courses Ordered</h5>
                                <table class="table">
                                    <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Unit Price</th>
                                        <th>Quantity</th>
                                        <th>Line Total</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr v-if="order.courses.length > 0" v-for="course in order.courses">
                                        <th scope="row">@{{ course.course.name[LANG] }}</th>
                                        <td>@{{ course.unit_price }}</td>
                                        <td>@{{ course.qty }}</td>
                                        <td>@{{ course.line_total }}</td>
                                    </tr>
                                    </tbody>
                                </table>
                                <div class="m-separator m-separator--dashed"></div>
                            </div>
                            <div class="col-md-10"></div>
                            <div class="col-md-2">
                                <div class="m-widget13">
                                    <div class="m-widget13__item"><span class="m-widget13__desc m--align-right">Subtotal:</span>
                                        <span class="m-widget13__text m-widget13__text-bolder">@{{ order.sub_total }}</span>
                                    </div>
                                    <div class="m-widget13__item"><span class="m-widget13__desc m--align-right">Discount:</span>
                                        <span class="m-widget13__text m-widget13__text-bolder">@{{ order.discount }}</span>
                                    </div>
                                    <div class="m-widget13__action m--align-right total-dir" style="padding-top: 0; margin-top: 0;">
                                        <div class="m-widget13__item"><span class="m-widget13__desc m--align-right">Total:</span>
                                            <span class="m-widget13__text m-widget13__text-bolder">@{{ order.total }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="modal_response_transaction" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">تفاصيل نتيجة المعاملة</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row" v-if="order&&order.transaction">
                                <code>@{{ JSON.parse(order.transaction.response) }}</code>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{trans_admin('close')}}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </order-details-index>
@endsection


@push('css')
    <style>
        body, html {
            font-weight: 300;
        }

        .m-section__content {
            color: #575962 !important;
        }

        h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, .h5, .h6 {
            font-family: inherit;
            font-weight: 500;
            line-height: 1.2;
            color: inherit;
            margin-top: 0;
        }
    </style>
@endpush
