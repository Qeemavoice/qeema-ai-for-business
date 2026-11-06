<div class="col-md-4">
    <table class="table table-bordered" id="html_table" width="100%">
        <thead class="m-datatable__head">
        @if($order->status_id === \App\Models\OrderStatus::IN_PROGRESS ||
            $order->status_id === \App\Models\OrderStatus::COMPLETED  ||
            $order->status_id === \App\Models\OrderStatus::CANCELED)
            <tr>
                <td class="text-center" colspan="2">
                    @if(user()->user_type_id === \App\Models\UserType::CLIENT)
                        @if($order->status_id === \App\Models\OrderStatus::IN_PROGRESS)
                            <a href="javascript:;" @click="receiveOrder" class="btn btn-warning recive-reservation font-weight-bold">استلام الحجز</a>
                        @endif
                    @endif

                    @if($order->status_id === \App\Models\OrderStatus::COMPLETED)
                        <button type="button" disabled class="btn btn-success">تم استلام الحجز</button>
                    @endif

                    @if($order->status_id === \App\Models\OrderStatus::CANCELED)
                        <button type="button" disabled class="btn btn-danger">تم إلغاء  الحجز</button>
                    @endif
                </td>
            </tr>
        @endif
        <tr>
            <th class="text-center font-weight-bold">كود الطلب</th>
            @isset($order)
                <td class="text-center">{{$order->show_id}}</td>
            @else
                <td class="text-center">-</td>
            @endif
        </tr>
        <tr>
            <th class="text-center font-weight-bold">التصنيف</th>
            @isset($voiceItem->details->category)
                <td class="text-center">{{$voiceItem->details->category->name}}</td>
            @else
                <td class="text-center">-</td>
            @endif
        </tr>
        <tr>
            <th class="text-center font-weight-bold">التاريخ</th>
            <td class="text-center">{{ date('Y-m-d') }}</td>
        </tr>
        <tr>
            <th class="text-center font-weight-bold">{{ trans_app('language') }}</th>
            @isset($voiceItem->details->language)
                <td class="text-center">{{$voiceItem->details->language->name}}</td>
            @else
                <td class="text-center">-</td>
            @endif
        </tr>
        <tr>
            <th class="text-center font-weight-bold">{{ trans_app('dialect') }}</th>
            @isset($voiceItem->details->dialect)
                <td class="text-center">{{$voiceItem->details->dialect->name}}</td>
            @else
                <td class="text-center">-</td>
            @endif
        </tr>
        <tr>
            <th  class="text-center font-weight-bold">{{ trans_app('scenario') }}</th>
            <td class="text-center">{{$voiceItem->item}}</td>
        </tr>
        <tr>
            <th class="text-center font-weight-bold">خدمات أخرى</th>
            <td class="text-center">
                @isset($servicesItems)
                    <ul>
                        @foreach($servicesItems as $service)
                           <li> {{$service->item}}</li>
                        @endforeach
                    </ul>
                @endisset

            </td>
        </tr>
        <tr>
            <th  class="text-center font-weight-bold">{{ trans_app('note_for_actor') }}</th>
            <td class="text-center">{{$voiceItem->notes}}</td>
        </tr>
        <tr>
            <th class="text-center font-weight-bold">{{  trans_app('word_count')}}</th>
            <td class="text-center">{{$voiceItem->details->word_count}}</td>
        </tr>
    </table>
</div>
