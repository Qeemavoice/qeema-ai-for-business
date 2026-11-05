<div class="tab-pane fade in " id="orders" role="tabpanel" aria-labelledby="orders-tab">
    <h5 style="color: #fea107;font-weight: bold;">لمتابعة الحجز اختر أيقونة الرسائل <i class="fa fa-comment"></i> بجانب الحجز الذي قمت باختياره</h5>

    <orders-index inline-template>
        <div class="card card-main">
            <div class="card-header"><h4>الحجوزات</h4></div>
            <div class="card-body table-responsive">
                <table class="table table-hover">
                    <thead>
                    <tr>
                        <th class="text-center" scope="col">#</th>
                        <th class="text-center" scope="col">  حالة الحجز</th>
                        <th class="text-center" scope="col">  التصنيف</th>
                        <th class="text-center" scope="col"> التاريخ</th>
                        <th class="text-center" scope="col"> عرض</th>
                        <th class="text-center" scope="col"> التقييم </th>
                        <th class="text-center" scope="col"> الرسائل </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="order in data">
                        <td class="text-center"> @{{ order.show_id }}</td>
                        <td class="text-center">@{{ order.status }}</td>
                        <td class="text-center">@{{ order.category }}</td>
                        <td class="text-center"> @{{ order.date }} <br> @{{ order.time }}</td>
                        <td class="text-center">
                            <a @click="detailsOrder(order.id)" style="float: unset !important; width: 43px; margin: 0 auto;" class="pull-right showDetails" href="javascript:void(0);"><i class="fa fa-eye"></i></a>
                        </td>
                        <td class="text-center">---</td>
                        <td><a :href="`{{route_app('chat.index')}}?t=${ order.t }`" target="_blank" style="float: unset !important; width: 43px; margin: 0 auto; " class="pull-right show_voice" ><i class="fa fa-comment"></i></a></td>
                    </tr>
                    </tbody>
                </table>
            </div>
            @include('app.dashboard.includes.order-details-modal')
        </div>
    </orders-index>
</div>
