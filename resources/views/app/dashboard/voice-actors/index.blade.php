@extends('app.layouts.app')

@push('page-title',meta('page-title'))
@push('css')
    <style>
        .delete-icon {
            position: relative;
            display: inline-block;
            padding-right: 2rem;
            float: left;
            padding-left: 2rem;
        }

        .delete-icon::after {
            content: "";
            position: absolute;
            top: 0;
            right: 0;
            width: 1px;
            height: 100%;
            background-color: gold;
        }


    </style>
@endpush
@section('content')
    <div class="container sound-page">
        @include('app.layouts.includes.nav')
        @include('app.layouts.includes.breadcrumbs')
    </div>

    @include('app.dashboard.voice-actors.includes.tab-list')

    <section class="profileContent">
        <div class="container">
            <div class="row">
                @include('app.dashboard.includes.profile-card')

                <div class="col-md-8">
                    <div class="tab-content" id="pills-tabContent">
                        @include('app.dashboard.voice-actors.includes.tabs.personal-information')
                        @include('app.dashboard.voice-actors.includes.tabs.samples')
                        @include('app.dashboard.voice-actors.includes.tabs.orders')
                        @include('app.dashboard.includes.tabs.notifications')
                        @include('app.dashboard.voice-actors.includes.tabs.payments')
                    </div>
                </div>
            </div>
        </div>
    </section>



@endsection


@push('js')
    <script>
        const hash = window.location.hash; // يحتوي على "#section1"
        const hashValue = hash.replace("#", ""); // بدون #
        navTabList(hashValue);

        function navTabList(id) {
           if(id) {
               @if(user()&&user()->user_type_id === \App\Models\UserType::VOICE_ACTOR)
               $('#personal-information').removeClass('active show');
               $('#personal-information-tab').removeClass('active');
               $('#orders').removeClass('active show');
               $('#orders-tab').removeClass('active');
               $('#notifications').removeClass('active show');
               $('#notifications-tab').removeClass('active');
               $('#payments').removeClass('active show');
               $('#payments-tab').removeClass('active');
               $('#samples').removeClass('active show');
               $('#samples-tab').removeClass('active');
               $('#' + id).addClass('active show');
               $('#' + id + '-tab').addClass('active show');
               @endif
           }
        }
    </script>
@endpush
@push('css')
    <style>
        @media (max-width: 767px){
            .profile-data {
                display:none;
            }
        }
        .switch.btn.btn-success,.switch.btn.btn-light{

            border-radius: 20px !important;
        }
        #profileSettings ul {
            background: #F8F8F8;
            padding: 0;
            display: flex;
            justify-content: center;
            width: 100%;

        }
        #profileSettings ul li a {
            border-radius: 0;
            background-color: #f8f8f8;
            color: #000;
            min-width: 170px;
            height: 50px;
            text-align: center;
            transition: .3s ease-in-out;
            line-height: 35px;

        }
        #profileSettings ul li a.active {
            background: #FEA107;
            color: #fff;
        }
        .profileContent .card img {
            height: 120px;
            width: 120px;
            margin: 0 auto;
            margin-top: 15px;
            border: unset;
            border-radius: 50%;


        }
        .profileContent .card.card-aside {
            border-top-left-radius: 30px;
            overflow: hidden;
            padding: 0;
            border: 0;

        }
        .profileContent .card {
            background: #fff;
            box-shadow: 1px 1px 20px 2px #e2e3e7;
            border: 0;

        }
        a.rat,
        a.show_voice,
        a.showDetails,
        a.editProfile {
            background: #FEA107;
            border-radius: 100%;
            padding: 9px 10px;
            font-size: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #fff;
        }
        .pull-right {
            float: left !important;
        }
        .required{
            color: red;
        }
        .swal2-container.swal2-rtl.swal2-center.swal2-backdrop-show {
            z-index: 99999999999 !important;
        }
    </style>
@endpush
