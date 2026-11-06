@extends('admin_panel.layouts.app')

@push('page-title')
    {{trans_admin('orders')}}
@endpush

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

@section('content')
    <orders-show
            :order="{{isset($order)?$order->toJson() : ''}}"
            :order_status="{{isset($order_status)?$order_status->toJson() : ''}}"
            inline-template>
        <div class="card">
            <!--begin::Card header-->
            <div class="card-header border-0 pt-6" data-select2-id="select2-data-80-1718">
                <!--begin::Card title-->
                <div class="card-title">
                    <div class="d-flex align-items-center position-relative my-1">
                        {{trans_admin('order_details')}}
                    </div>
                </div>
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
                                                <option v-for="status in order_status" :value="status.id">@{{ status.name[LANG] }}</option>
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
                                        <td>@{{ order.full_name }}</td>
                                    </tr>
                                    <tr>
                                        <td>Customer Email</td>
                                        <td>@{{ order.email }}</td>
                                    </tr>
                                    <tr>
                                        <td>Customer phone</td>
                                        <td>@{{ order.phone }}</td>
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
                                        <td>@{{ order.payment_method.name }}</td>
                                    </tr>

                                    <tr>
                                        <td>Transaction ID</td>
                                        <td>@{{ order.transaction.transaction_id }}</td>
                                    </tr>

                                    <tr>
                                        <td>Response</td>
                                        <td>
                                            <a v-if="order.transaction.payment_method_id == {{\App\Models\PaymentMethod::BANK_TRANSFER}}" :href="order.transaction.image_url" target="_blank">
                                                <svg fill="none" height="34" viewBox="0 0 34 34" width="34" xmlns="http://www.w3.org/2000/svg">
                                                    <g clip-path="url(#clip0_224_17131)">
                                                        <path
                                                                d="M11.8438 15.3125C11.5702 15.3125 11.3079 15.4211 11.1145 15.6145C10.9211 15.8079 10.8125 16.0702 10.8125 16.3438C10.8125 16.6173 10.9211 16.8796 11.1145 17.073C11.3079 17.2664 11.5702 17.375 11.8438 17.375H22.1562C22.4298 17.375 22.6921 17.2664 22.8855 17.073C23.0789 16.8796 23.1875 16.6173 23.1875 16.3438C23.1875 16.0702 23.0789 15.8079 22.8855 15.6145C22.6921 15.4211 22.4298 15.3125 22.1562 15.3125H11.8438ZM10.8125 20.4688C10.8125 20.1952 10.9211 19.9329 11.1145 19.7395C11.3079 19.5461 11.5702 19.4375 11.8438 19.4375H22.1562C22.4298 19.4375 22.6921 19.5461 22.8855 19.7395C23.0789 19.9329 23.1875 20.1952 23.1875 20.4688C23.1875 20.7423 23.0789 21.0046 22.8855 21.198C22.6921 21.3914 22.4298 21.5 22.1562 21.5H11.8438C11.5702 21.5 11.3079 21.3914 11.1145 21.198C10.9211 21.0046 10.8125 20.7423 10.8125 20.4688ZM10.8125 24.5938C10.8125 24.3202 10.9211 24.0579 11.1145 23.8645C11.3079 23.6711 11.5702 23.5625 11.8438 23.5625H15.9688C16.2423 23.5625 16.5046 23.6711 16.698 23.8645C16.8914 24.0579 17 24.3202 17 24.5938C17 24.8673 16.8914 25.1296 16.698 25.323C16.5046 25.5164 16.2423 25.625 15.9688 25.625H11.8438C11.5702 25.625 11.3079 25.5164 11.1145 25.323C10.9211 25.1296 10.8125 24.8673 10.8125 24.5938Z"
                                                                fill="#8B734B"></path>
                                                        <path
                                                                d="M20.0938 0.875H8.75C7.65598 0.875 6.60677 1.3096 5.83318 2.08318C5.0596 2.85677 4.625 3.90598 4.625 5V29.75C4.625 30.844 5.0596 31.8932 5.83318 32.6668C6.60677 33.4404 7.65598 33.875 8.75 33.875H25.25C26.344 33.875 27.3932 33.4404 28.1668 32.6668C28.9404 31.8932 29.375 30.844 29.375 29.75V10.1562L20.0938 0.875ZM20.0938 2.9375V7.0625C20.0938 7.88301 20.4197 8.66992 20.9999 9.25011C21.5801 9.8303 22.367 10.1562 23.1875 10.1562H27.3125V29.75C27.3125 30.297 27.0952 30.8216 26.7084 31.2084C26.3216 31.5952 25.797 31.8125 25.25 31.8125H8.75C8.20299 31.8125 7.67839 31.5952 7.29159 31.2084C6.9048 30.8216 6.6875 30.297 6.6875 29.75V5C6.6875 4.45299 6.9048 3.92839 7.29159 3.54159C7.67839 3.1548 8.20299 2.9375 8.75 2.9375H20.0938Z"
                                                                fill="#8B734B"></path>
                                                    </g>
                                                    <defs>
                                                        <clipPath id="clip0_224_17131">
                                                            <rect fill="white" height="33" transform="translate(0.5 0.875)" width="33"></rect>
                                                        </clipPath>
                                                    </defs>
                                                </svg>
                                            </a>
                                            <code v-else>
                                                @{{ JSON.parse(order.transaction.response) }}
                                            </code>

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
                                        <span class="m-widget13__text m-widget13__text-bolder">@{{ order.sub_total }}</span></div>

                                    <div class="m-widget13__item"><span class="m-widget13__desc m--align-right">Discount:</span>
                                        <span class="m-widget13__text m-widget13__text-bolder">@{{ order.discount }}</span></div>
                                    <div class="m-widget13__action m--align-right total-dir"
                                         style="padding-top: 0px; margin-top: 0px;">
                                        <div class="m-widget13__item"><span class="m-widget13__desc m--align-right">Total:</span>
                                            <span class="m-widget13__text m-widget13__text-bolder">@{{ order.total }}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </orders-show>
@endsection
