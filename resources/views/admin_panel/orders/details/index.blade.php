@extends('admin_panel.layouts.app')

@push('page-title')
    {{trans_admin('orders')}}
@endpush

@section('content')
    <order-details-index :order="{{isset($order)?$order->toJson() : 'null'}}" inline-template>
        <div class="d-flex flex-column gap-7 gap-lg-10">
            <div class="d-flex flex-wrap flex-stack gap-5 gap-lg-10">
                @include('admin_panel.orders.details.includes.tabs')
            </div>
            <div class="tab-content">
                @include('admin_panel.orders.details.includes.order-summary-tab')
                @include('admin_panel.orders.details.includes.order-transactions-tab')
                @include('admin_panel.orders.details.includes.order-cancellation-requests-tab')
                @include('admin_panel.orders.details.includes.order-chats-tab')
            </div>
        </div>
    </order-details-index>
@endsection
