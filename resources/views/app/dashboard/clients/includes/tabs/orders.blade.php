<div class="tab-pane fade in " id="orders" role="tabpanel" aria-labelledby="orders-tab">
    <h5 style="color: #fea107;font-weight: bold;">لمتابعة الحجز اختر أيقونة الرسائل <i class="fa fa-comment"></i> بجانب الحجز الذي قمت باختياره</h5>

    <orders-index inline-template>
        <div class="card card-main" v-loading="form.loadingDisplay">
            <div class="card-header"><h4>الحجوزات</h4></div>
            <div class="card-body table-responsive">
                <table class="table table-hover">
                    <thead>
                    <tr>
                        <th class="text-center" scope="col">#</th>
                        <th class="text-center" scope="col">  حالة الحجز</th>
                        <th class="text-center" scope="col">  التصنيف</th>
                        <th class="text-center" scope="col"> التاريخ</th>
                        <th class="text-center" scope="col">   عرض</th>
                        <th class="text-center" scope="col"> احجز مرة اخرى</th>
                        <th class="text-center" scope="col"> التقييم </th>
                        <th class="text-center" scope="col"> الرسائل </th>
                    <th scope="col" class="text-center"> إلغاء الحجز</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="order in data">
                        <td class="text-center"> @{{ order.show_id }}</td>
                        <td class="text-center">@{{ order.status }}</td>
                        <td class="text-center">@{{ order.category }}</td>
                        <td class="text-center"> @{{ order.date }} <br> @{{ order.time }}</td>
                        <td class="text-center"><a @click="detailsOrder(order.id)" style="float: unset !important; width: 43px; margin: 0 auto;" class="pull-right showDetails" href="javascript:void(0);"><i class="fa fa-eye"></i></a></td>
                        <td class="text-center"><a :href="'{{ route_app('booking.index', ['slug' => '__slug__']) }}'.replace('__slug__', order.voide_slug)" target="_blank" style="float: unset !important; width: 43px; margin: 0 auto; " class="pull-right show_voice" ><i class="fa fa-book"></i></a></td>
                        <td class="text-center">
                            <span v-if="order.status_id == {{\App\Models\OrderStatus::IN_PROGRESS}}">-</span>
{{--                            <a href="javascript:;" v-if="order.status_id == {{\App\Models\OrderStatus::IN_PROGRESS}}" @click="ratingOrder(order.id)" style="float: unset !important; width: 43px; margin: 0 auto;" class="pull-right rat">--}}
{{--                                <i class="fa fa-star"></i>--}}
{{--                            </a>--}}
                            <a href="javascript:;" v-if="order.status_id == {{\App\Models\OrderStatus::COMPLETED}}" @click="detailsRating(order.id)" style="float: unset !important; width: 43px; margin: 0 auto;" class="pull-right rat">
                                <i class="fa fa-star"></i>
                            </a>
                        </td>
                        <td><a :href="`{{route_app('chat.index')}}?t=${ order.t }`" target="_blank" style="float: unset !important; width: 43px; margin: 0 auto; " class="pull-right show_voice" ><i class="fa fa-comment"></i></a></td>
                        <td class="text-center">
                            <a href="javascript:;" v-if="order.status_id == {{\App\Models\OrderStatus::IN_PROGRESS}}" @click="cancelOrder(order.id)" style="float: unset !important; width: 43px; margin: 0 auto;" class="cancel_reservation show_voice" ><i class="fas fa-times"></i></a>
                            <span v-if="order.status_id == {{\App\Models\OrderStatus::CANCELLATION_REQUEST}}"><span class="badge badge-dark">قيد المراجعة</span></span>
                            <span v-else>-</span>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            @include('app.dashboard.includes.order-details-modal')
            @include('app.dashboard.includes.rating-details-modal')
{{--            @include('app.dashboard.clients.includes.form-order-rating-modal')--}}
        </div>
    </orders-index>
</div>
