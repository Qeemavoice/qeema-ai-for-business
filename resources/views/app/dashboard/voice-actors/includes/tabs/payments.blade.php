<div class="tab-pane fade in " id="payments" role="tabpanel" aria-labelledby="payments-tab">
    <div class="card card-main">
        <div class="card-header">
            <p>مُعرف المحفظة:{{$wallet->account_id}}</p>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-3 text-center">
                    <p>الرصيد الكلي </p>
                    <p style="font-weight: bold;">{{$currency . $wallet->all_profits}}</p>
                </div>
                <div class="col-md-3 text-center">
                    <p>الرصيد المعلق </p>
                    <p style="font-weight: bold;">{{$currency .$wallet->hold_profits}}</p>
                </div>
                <div class="col-md-3 text-center">
                    <p>الرصيد القابل للسحب </p>
                    <p style="font-weight: bold;">{{$currency .$wallet->profits}}</p>
                </div>
                <div class="col-md-3 text-center">
                    <p>الرصيد المسحوب </p>
                    <p style="font-weight: bold;">{{$currency .$wallet->withdrawal_profits}}</p>
                </div>
            </div>
        </div>
    </div>
        <br>
        <br>
    <voice-actor-payment-index inline-template>
        <div class="card card-main">
            <div class="card-header"><h4>الأرباح</h4></div>
            <div class="card-body table-responsive">
                <table class="table table-hover">
                    <thead>
                    <tr>
                        <th scope="col" class="text-center">تاريخ ووقت العملية</th>
                        <th scope="col" class="text-center"> الحالة</th>
                        <th scope="col" class="text-center"> القيمة</th>
                        <th scope="col" class="text-center"> تاريخ تحويل الرصيد</th>
                    </tr>
                    </thead>
                    <tbody>

                    </tbody>
                </table>
            </div>
        </div>
    </voice-actor-payment-index>

</div>
