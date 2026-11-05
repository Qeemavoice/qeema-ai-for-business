@extends('app.layouts.app')

@push('page-title',meta('page-title'))

@section('content')
    <div class="container sound-page">
        @include('app.layouts.includes.nav')
        @include('app.layouts.includes.breadcrumbs')
    </div>
    <section class="profileContent" id="m-content">
        <div class="container">
            <chat-index :order-id="{{isset($order) ? $order->id : 'null'}}"
                        :user-message-id="{{isset($userMessage) ? $userMessage->id : 'null'}}"
                        :from-user="{{isset($fromUser) ? $fromUser : 'null'}}"
                        :to-user="{{isset($toUser) ? $toUser : 'null'}}"
                        inline-template>
                <div class="row">
                    <div class="col-lg-12">
                        <div class="m-portlet m-portlet--mobile" id="m_blockui_2_portlet">
                            <div class="m-portlet__body">
                                <div id="table-container">
                                    <div class="row">
                                        @include('app.dashboard.chat.includes.order-summary')
                                        @include('app.dashboard.chat.includes.messages')
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </chat-index>
        </div>
    </section>

    @include('app.dashboard.clients.includes.form-order-rating-modal')

@endsection

@push('css')
    <style>
        .vue-star-rating {
            justify-content: center!important;
        }
        .bg-gray{
            background-color: #f1f1f1;
        }
        .bg-green{
            background-color: #55DBA8;
        }
        .msg-receiver .message{
            padding: 5px;
            border-radius: 5px;
            background: #3d3b56;
            color: #fff;

        }
        .msg-receiver .img-receiver img{
            width: 40px;
            height: 40px;
            border-radius: 50%;
        }
        .msg-receiver .content-msg{
            vertical-align: middle;
        }
        .sender{
            text-align:left;
        }
        .receiver{
            text-align:right;
        }
        .pay-spin{
            display:none;
        }
        .pay-spin i{
            -webkit-animation: fa-spin 2s infinite linear;
            animation: fa-spin 2s infinite linear;
        }
    </style>
@endpush
