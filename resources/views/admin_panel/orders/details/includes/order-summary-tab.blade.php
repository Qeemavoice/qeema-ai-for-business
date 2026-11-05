<div class="tab-pane fade active show" id="order_summary" role="tab-panel">
    <div class="d-flex flex-column gap-7 gap-lg-10">
        <div class="d-flex flex-column flex-xl-row gap-7 gap-lg-10">
            <div class="card card-flush py-4 flex-row-fluid">
                <div class="card-header"><div class="card-title"><h2> تفاصيل الطلب({{$order->show_id}})</h2></div></div>
                <div class="card-body pt-0">
                    <div class="table-responsive">
                        <table class="table align-middle table-row-bordered mb-0 fs-6 gy-5 min-w-300px">
                            <tbody class="fw-bold text-gray-600">
                            <tr>
                                <td class="text-muted">
                                    <div class="d-flex align-items-center">
                                        <span class="svg-icon svg-icon-2 me-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                                                <path opacity="0.3" d="M19 3.40002C18.4 3.40002 18 3.80002 18 4.40002V8.40002H14V4.40002C14 3.80002 13.6 3.40002 13 3.40002C12.4 3.40002 12 3.80002 12 4.40002V8.40002H8V4.40002C8 3.80002 7.6 3.40002 7 3.40002C6.4 3.40002 6 3.80002 6 4.40002V8.40002H2V4.40002C2 3.80002 1.6 3.40002 1 3.40002C0.4 3.40002 0 3.80002 0 4.40002V19.4C0 20 0.4 20.4 1 20.4H19C19.6 20.4 20 20 20 19.4V4.40002C20 3.80002 19.6 3.40002 19 3.40002ZM18 10.4V13.4H14V10.4H18ZM12 10.4V13.4H8V10.4H12ZM12 15.4V18.4H8V15.4H12ZM6 10.4V13.4H2V10.4H6ZM2 15.4H6V18.4H2V15.4ZM14 18.4V15.4H18V18.4H14Z" fill="black"></path>
                                                <path d="M19 0.400024H1C0.4 0.400024 0 0.800024 0 1.40002V4.40002C0 5.00002 0.4 5.40002 1 5.40002H19C19.6 5.40002 20 5.00002 20 4.40002V1.40002C20 0.800024 19.6 0.400024 19 0.400024Z" fill="black"></path>
                                            </svg>
                                        </span>
                                        تاريخ الطلب
                                    </div>
                                </td>
                                <td class="fw-bolder text-end">{{$order->created_at}}</td>
                            </tr>
                            <tr>
                                <td class="text-muted">
                                    <div class="d-flex align-items-center">
                                        <span class="svg-icon svg-icon-2 me-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M20 8H16C15.4 8 15 8.4 15 9V16H10V17C10 17.6 10.4 18 11 18H16C16 16.9 16.9 16 18 16C19.1 16 20 16.9 20 18H21C21.6 18 22 17.6 22 17V13L20 8Z" fill="black"></path>
                                                <path opacity="0.3" d="M20 18C20 19.1 19.1 20 18 20C16.9 20 16 19.1 16 18C16 16.9 16.9 16 18 16C19.1 16 20 16.9 20 18ZM15 4C15 3.4 14.6 3 14 3H3C2.4 3 2 3.4 2 4V13C2 13.6 2.4 14 3 14H15V4ZM6 16C4.9 16 4 16.9 4 18C4 19.1 4.9 20 6 20C7.1 20 8 19.1 8 18C8 16.9 7.1 16 6 16Z" fill="black"></path>
                                            </svg>
                                            </span>
                                        نوع الطلب
                                    </div>
                                </td>
                                <td class="fw-bolder text-end"><order-type :type="{{$order->type}}"></order-type></td>
                            </tr>
                            <tr>
                                <td class="text-muted">
                                    <div class="d-flex align-items-center">
                                            <span class="svg-icon svg-icon-2 me-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path d="M20 8H16C15.4 8 15 8.4 15 9V16H10V17C10 17.6 10.4 18 11 18H16C16 16.9 16.9 16 18 16C19.1 16 20 16.9 20 18H21C21.6 18 22 17.6 22 17V13L20 8Z" fill="black"></path>
                                                    <path opacity="0.3" d="M20 18C20 19.1 19.1 20 18 20C16.9 20 16 19.1 16 18C16 16.9 16.9 16 18 16C19.1 16 20 16.9 20 18ZM15 4C15 3.4 14.6 3 14 3H3C2.4 3 2 3.4 2 4V13C2 13.6 2.4 14 3 14H15V4ZM6 16C4.9 16 4 16.9 4 18C4 19.1 4.9 20 6 20C7.1 20 8 19.1 8 18C8 16.9 7.1 16 6 16Z" fill="black"></path>
                                                </svg>
                                            </span>
                                        حالة الطلب
                                    </div>
                                </td>
                                <td class="fw-bolder text-end"><order-status :status="{{$order->status}}"></order-status></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            @if($order->customer)
            <div class="card card-flush py-4 flex-row-fluid">
                <div class="card-header"><div class="card-title"><h2>تفاصيل الزبون</h2></div></div>
                <div class="card-body pt-0">
                    <div class="table-responsive">
                        <table class="table align-middle table-row-bordered mb-0 fs-6 gy-5 min-w-300px">
                            <tbody class="fw-bold text-gray-600">
                            <tr>
                                <td class="text-muted">
                                    <div class="d-flex align-items-center">
                                            <span class="svg-icon svg-icon-2 me-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path opacity="0.3" d="M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12ZM12 7C10.3 7 9 8.3 9 10C9 11.7 10.3 13 12 13C13.7 13 15 11.7 15 10C15 8.3 13.7 7 12 7Z" fill="black"></path>
                                                    <path d="M12 22C14.6 22 17 21 18.7 19.4C17.9 16.9 15.2 15 12 15C8.8 15 6.09999 16.9 5.29999 19.4C6.99999 21 9.4 22 12 22Z" fill="black"></path>
                                                </svg>
                                            </span>
                                        الإسم
                                    </div>
                                </td>

                                <td class="fw-bolder text-end">
                                    <div class="d-flex align-items-center justify-content-end">

                                        <div class="symbol symbol-circle symbol-25px overflow-hidden me-3">
                                            <a :href=`${$admin_url}/clients?id={{$order->customer_id}}` target="_blank">
                                                <div class="symbol-label">
                                                    <img src="{{$order->customer->image_url}}" alt="" class="w-100">
                                                </div>
                                            </a>
                                        </div>

                                        <a :href=`${$admin_url}/clients?id={{$order->customer_id}}` target="_blank" class="text-gray-600 text-hover-primary">{{$order->customer->full_name}}</a>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td class="text-muted">
                                    <div class="d-flex align-items-center">
                                            <span class="svg-icon svg-icon-2 me-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path opacity="0.3" d="M21 19H3C2.4 19 2 18.6 2 18V6C2 5.4 2.4 5 3 5H21C21.6 5 22 5.4 22 6V18C22 18.6 21.6 19 21 19Z" fill="black"></path>
                                                    <path d="M21 5H2.99999C2.69999 5 2.49999 5.10005 2.29999 5.30005L11.2 13.3C11.7 13.7 12.4 13.7 12.8 13.3L21.7 5.30005C21.5 5.10005 21.3 5 21 5Z" fill="black"></path>
                                                </svg>
                                            </span>
                                        البريد الإلكتروني
                                    </div>
                                </td>
                                <td class="fw-bolder text-end">
                                    <a href="mailto:{{$order->customer->email}}" class="text-gray-600 text-hover-primary">{{$order->customer->email}}</a>
                                </td>
                            </tr>
                            <tr>
                                <td class="text-muted">
                                    <div class="d-flex align-items-center">
                                            <span class="svg-icon svg-icon-2 me-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path d="M5 20H19V21C19 21.6 18.6 22 18 22H6C5.4 22 5 21.6 5 21V20ZM19 3C19 2.4 18.6 2 18 2H6C5.4 2 5 2.4 5 3V4H19V3Z" fill="black"></path>
                                                    <path opacity="0.3" d="M19 4H5V20H19V4Z" fill="black"></path>
                                                </svg>
                                            </span>
                                        رقم الهاتف
                                    </div>
                                </td>
                                <td class="fw-bolder text-end">{{$order->customer_phone}}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            @endif

            @if($order->voiceActor)
                @if($order->order_type_id === \App\Models\OrderType::BOOKING_VOICE)
                    <div class="card card-flush py-4 flex-row-fluid">
                        <div class="card-header"><div class="card-title"><h2>تفاصيل المعلق الصوتي</h2></div></div>
                        <div class="card-body pt-0">
                            <div class="table-responsive">
                                <table class="table align-middle table-row-bordered mb-0 fs-6 gy-5 min-w-300px">
                                    <tbody class="fw-bold text-gray-600">
                                    <tr>
                                        <td class="text-muted">
                                            <div class="d-flex align-items-center">
                                                <span class="svg-icon svg-icon-2 me-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        <path opacity="0.3" d="M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12ZM12 7C10.3 7 9 8.3 9 10C9 11.7 10.3 13 12 13C13.7 13 15 11.7 15 10C15 8.3 13.7 7 12 7Z" fill="black"></path>
                                                        <path d="M12 22C14.6 22 17 21 18.7 19.4C17.9 16.9 15.2 15 12 15C8.8 15 6.09999 16.9 5.29999 19.4C6.99999 21 9.4 22 12 22Z" fill="black"></path>
                                                    </svg>
                                                </span>
                                                الإسم
                                            </div>
                                        </td>
                                        <td class="fw-bolder text-end">
                                            <div class="d-flex align-items-center justify-content-end">

                                                <div class="symbol symbol-circle symbol-25px overflow-hidden me-3">
                                                    <a :href=`${$admin_url}/voice-actors?id={{$order->voice_actor_id}}` target="_blank">
                                                        <div class="symbol-label">
                                                            <img src="{{$order->voiceActor->image_url}}" alt="" class="w-100">
                                                        </div>
                                                    </a>
                                                </div>
                                                <a :href=`${$admin_url}/voice-actors?id={{$order->voice_actor_id}}` target="_blank" class="text-gray-600 text-hover-primary">{{$order->voiceActor->full_name}}</a>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="text-muted">
                                            <div class="d-flex align-items-center">
                                                <span class="svg-icon svg-icon-2 me-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        <path opacity="0.3" d="M21 19H3C2.4 19 2 18.6 2 18V6C2 5.4 2.4 5 3 5H21C21.6 5 22 5.4 22 6V18C22 18.6 21.6 19 21 19Z" fill="black"></path>
                                                        <path d="M21 5H2.99999C2.69999 5 2.49999 5.10005 2.29999 5.30005L11.2 13.3C11.7 13.7 12.4 13.7 12.8 13.3L21.7 5.30005C21.5 5.10005 21.3 5 21 5Z" fill="black"></path>
                                                    </svg>
                                                </span>
                                                البريد الإلكتروني
                                            </div>
                                        </td>
                                        <td class="fw-bolder text-end">
                                            <a href="mailto:{{$order->voiceActor->email}}" class="text-gray-600 text-hover-primary">{{$order->voiceActor->email}}</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="text-muted">
                                            <div class="d-flex align-items-center">
                                                <span class="svg-icon svg-icon-2 me-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        <path d="M5 20H19V21C19 21.6 18.6 22 18 22H6C5.4 22 5 21.6 5 21V20ZM19 3C19 2.4 18.6 2 18 2H6C5.4 2 5 2.4 5 3V4H19V3Z" fill="black"></path>
                                                        <path opacity="0.3" d="M19 4H5V20H19V4Z" fill="black"></path>
                                                    </svg>
                                                </span>
                                                رقم الهاتف
                                            </div>
                                        </td>
                                        <td class="fw-bolder text-end">{{$order->voiceActor->profile->whatsapp_number}}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                @endif
            @endif
        </div>

        <div class="d-flex flex-column gap-7 gap-lg-10">
            <div class="d-flex flex-column flex-xl-row gap-7 gap-lg-10">
                @if($order->show_list_of_price)
                    @if($order->order_type_id === \App\Models\OrderType::BOOKING_VOICE)
                        <div class="card card-flush py-4 flex-row-fluid overflow-hidden col-md-8">
                            <div class="card-header"><div class="card-title"><h2>بيانات الحجز</h2></div></div>
                            <div class="card-body pt-0">
                                <div class="row mb-10">
                                    <div class="col-xl-6 mb-15 mb-xl-0 pe-5">
                                        <h3 class="mb-2">الصوت</h3>
                                        <p class="fs-6 text-gray-600 fw-bold mb-6 mb-lg-15">{!! $order->show_list_of_price->script->voice->title->{get_locale()}!!}</p>
                                    </div>
                                    <div class="col-xl-6 mb-15 mb-xl-0 pe-5">
                                        <h3 class="mb-2">سعر الدقيقة</h3>
                                        <p class="fs-6 text-gray-600 fw-bold mb-6 mb-lg-15">{!! \App\Services\CurrencyHelper::getSymbol().$order->show_list_of_price->script->pricePerMinute !!}</p>
                                    </div>
                                    <div class="col-xl-12 mb-15 mb-xl-0 pe-5">
                                        <h3 class="mb-2"></h3>
                                        <p class="fs-6 text-gray-600 fw-bold mb-6 mb-lg-15">
                                            <audio controls>
                                                <source src="{{$order->show_list_of_price->script->voice->audio_file_url}}" type="audio/ogg">
                                                <source src="{{$order->show_list_of_price->script->voice->audio_file_url}}" type="audio/mpeg">
                                                Your browser does not support the audio element.
                                            </audio>
                                        </p>
                                    </div>
                                    <div class="col-xl-6 mb-15 mb-xl-0 pe-5">
                                        <h3 class="mb-2">اللهجة</h3>
                                        <p class="fs-6 text-gray-600 fw-bold mb-6 mb-lg-15">{!! $order->show_list_of_price->script->voice->dialect->name->{get_locale()} !!}</p>
                                    </div>
                                    <div class="col-xl-6 mb-15 mb-xl-0 pe-5">
                                        <h3 class="mb-2">اللغة</h3>
                                        <p class="fs-6 text-gray-600 fw-bold mb-6 mb-lg-15">{!! $order->show_list_of_price->script->voice->language->name->{get_locale()} !!}</p>
                                    </div>
                                    <div class="col-xl-12 mb-15 mb-xl-0 pe-5">
                                        <h3 class="mb-2">السناريو</h3>
                                        <p class="fs-6 text-gray-600 fw-bold mb-6 mb-lg-15">{!! $order->show_list_of_price->script->scenario !!}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    @endif
                @endif
                <div class="card card-flush py-4 flex-row-fluid overflow-hidden col-md-4">
                    <div class="card-header"><div class="card-title"><h2>ملاحظات</h2></div></div>
                    <div class="card-body pt-0">{{$order->note ? $order->note : trans_admin('not_found')}}</div>
                </div>
            </div>
        </div>

        <div class="d-flex flex-column gap-7 gap-lg-10">
            <div class="card card-flush py-4 flex-row-fluid overflow-hidden">
                <div class="card-header"><div class="card-title"><h2>{{$order->show_id}}</h2></div></div>
                <div class="card-body pt-0">
                    <div class="table-responsive">
                        <table class="table align-middle table-row-dashed fs-6 gy-5 mb-0">
                            <thead>
                            <tr class="text-start text-gray-400 fw-bolder fs-7 text-uppercase gs-0">
                                <th class="min-w-175px">العنصر</th>
                                <th class="min-w-100px text-end">عدد الكلمات</th>
                                <th class="min-w-100px text-end">عدد الدقائق</th>
                                <th class="min-w-100px text-end">سعر الدقيقة</th>
                                <th class="min-w-100px text-end">النسبة المئوية(%)</th>
                                <th class="min-w-100px text-end">المجموع</th>
                            </tr>
                            </thead>
                            <tbody class="fw-bold text-gray-600">
                            @foreach($order->items as $item)
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="ms-5">
                                            <a href="#" class="fw-bolder text-gray-600 text-hover-primary">{{$item->show_item}}</a>
                                            {{--<div class="fs-7 text-muted">Delivery Date: 03/03/2022</div>--}}
                                        </div>
                                    </div>
                                </td>
                                <td class="text-end">{{$item->details ? $item->details->word_count : 0}}</td>
                                <td class="text-end">{{$item->details ? $item->details->number_of_minutes: 0}}</td>
                                <td class="text-end">{{$item->show_unit_price}}</td>
                                <td class="text-end">%{{$item->percentage > 0 ? $item->percentage : 0}}</td>
                                <td class="text-end">{{$item->show_line_total}}</td>
                            </tr>
                            @endforeach
                            @if(isset($order->list_of_price->platFormCommission))
                            <tr>
                                <td colspan="5" class="text-end">عمولة المنصة({{$order->list_of_price->platFormCommission->percentage}}%)</td>
                                <td class="text-end">{{ \App\Services\CurrencyHelper::getSymbol() .$order->list_of_price->platFormCommission->value}}</td>
                            </tr>
                            @endif
                            @if($order->payment_method_percentage)
                            <tr>
                                <td colspan="5" class="text-end">عمولة بوابة الدفع({{$order->payment_method_percentage}}%)</td>
                                <td class="text-end">{{$order->show_payment_method_value}}</td>
                            </tr>
                            @endif
                            @if($order->discount_percentage)
                            <tr>
                                <td colspan="5" class="text-end">الكوبون({{$order->discount_percentage}}%)</td>
                                <td class="text-end">{{$order->show_discount_value}}</td>
                            </tr>
                            @endif
                            <tr>
                                <td colspan="5" class="fs-3 text-dark text-end">المجموع الإجمالي</td>
                                <td class="text-dark fs-3 fw-boldest text-end">{{$order->show_total}}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
