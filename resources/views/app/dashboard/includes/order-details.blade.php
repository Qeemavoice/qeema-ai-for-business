<div class="modal fade in" id="modal_order_details" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel">
    <div class="modal-dialog modal-lg modal-dialog-centered " role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">التفاصيل</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close" style="margin-right:auto;margin-left:inherit"><span>&times;</span></button>
            </div>
            <div class="modal-body" v-if="orderDetails">
                <div class="table-responsive">
                    <table class="table table-bordered table-striped">
                        <tbody>
                        <tr>
                            <th>المعرف</th>
                            <td>@{{ orderDetails.show_id }}</td>
                        </tr>
                        <tr>
                            <th>الإسم</th>
                            <td>@{{ orderDetails.customer_name }}</td>
                        </tr>
                        <tr>
                            <th>البريد الإلكتروني</th>
                            <td>@{{ orderDetails.customer_email }}</td>
                        </tr>
                        <tr>
                            <th>اللغة</th>
                            <td>@{{ orderDetails.language }}</td>
                        </tr>
                        <tr>
                            <th>اللهجة</th>
                            <td>@{{ orderDetails.dialect }}</td>
                        </tr>
                        <tr>
                            <th>التصنيف</th>
                            <td>@{{ orderDetails.category }}</td>
                        </tr>
                        <tr>
                            <th>الصوت</th>
                            <td>
                                <audio controlslist="nodownload"
                                       :src="orderDetails.audio_file_url"
                                       controls="true"
                                       :id="'voice_audio_'+orderDetails.voice_id"
                                       class="ppbutton fa fa-play">
                                </audio>
                            </td>
                        </tr>
                        <tr>
                            <th>السيناريو</th>
                            <td>@{{ orderDetails.senario }}</td>
                        </tr>
                        <tr>
                            <th>خدمات أخرى</th>
                            <td>
                                <ul>
                                    <li v-for="(service,index) in orderDetails.services">
                                        @{{service.item}}
                                    </li>
                                </ul>
                            </td>
                        </tr>
                        <tr>
                            <th>ملاحظات للمؤدي الصوتي</th>
                            <td>@{{ orderDetails.notes }}</td>
                        </tr>
                        <tr>
                            <th>عدد الكلمات</th>
                            <td>@{{ orderDetails.numberOfWords }}</td>
                        </tr>
                        <tr>
                            <th>سعر الدقيقة</th>
                            <td>@{{ orderDetails.numberOfWords }}</td>
                        </tr>
                        <tr>
                            <th>عدد الدقائق</th>
                            <td>@{{ orderDetails.numberOfMinutes }}</td>
                        </tr>
                        <tr>
                            <th>إجمالي سعر الدقائق</th>
                            <td>@{{ orderDetails.pricePerMinutes }}</td>
                        </tr>
                        <tr>
                            <th>سعر الخدمات الإضافية</th>
                            <td>@{{ orderDetails.priceServices }}</td>
                        </tr>
                        <tr>
                            <th>سعر العمل كامل</th>
                            <td>@{{ orderDetails.subTotal }}</td>
                        </tr>
                        <tr>
                            <th>
                                عمولة بوابة الدفع
                                <b>(@{{ orderDetails.paymentCommissionPercentagee }}%)</b>
                            </th>
                            <td>@{{ orderDetails.paymentCommissionValue }}</td>
                        </tr>
                        <tr>
                            <th>المبلغ المدفوع</th>
                            <td>@{{ orderDetails.total }}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">اخفاء</button>
            </div>
        </div>
    </div>
</div>
