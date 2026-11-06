<div class="tab-pane fade" id="invoices" role="tabpanel" aria-labelledby="invoices-tab">
    <invoices-index inline-template>
        <div class="card card-main">
            <div class="card-header"><h4> فواتيري </h4></div>
            <div class="card-body table-responsive">
                <table class="table table-hover">
                    <thead>
                    <tr>
                        <th scope="col"> رقم المعاملة </th>
                        <th scope="col">نوع المعاملة </th>
                        <th scope="col"> رقم الطلب </th>
                        <th scope="col">طريقة الدفع</th>
                        <th scope="col"> المبلغ</th>
                        <th scope="col"> التاريخ</th>
{{--                        <th scope="col">تحميل</th>--}}
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="invoice in data">
                        <td>@{{ invoice.transaction_id }}</td>
                        <td>@{{ invoice.transaction_type }}</td>
                        <td>@{{ invoice.order_show_id }}</td>
                        <td>@{{ invoice.payment_method }}</td>
                        <td>@{{ invoice.amount_paid }}</td>
                        <td>@{{ invoice.created_at }}</td>
{{--                        <td><a href="javascript:;" download><i class="fa fa-file-invoice"></i></a> </td>--}}
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </invoices-index>
</div>
