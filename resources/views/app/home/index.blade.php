@extends('app.layouts.app')

@push('page-title',meta('page-title'))

@php
    $enableContactUs = true;
@endphp

@section('content')
    <div class="container-fluid">
        @include('app.layouts.includes.nav')

        @isset($homePageWelcomeSection)
            @include('app.home.includes.hero-section')
        @endisset

        @include('app.home.includes.booking-steps')

        @isset($data['categories'])
            @include('app.home.includes.categories')
        @endisset

        @isset($voices)
        @include('app.home.includes.voices')
        @endisset

        @isset($ourWorks)
            @include('app.home.includes.voice-works')
        @endisset

        @isset($customers)
            @include('app.home.includes.our-customers')
        @endisset

        @isset($partners)
            @include('app.home.includes.partners')
        @endisset

        @isset($faqs)
            @include('app.layouts.includes.faqs')
        @endisset

        @isset($homePageModalSection)
            @include('app.home.includes.file-modal')
        @endisset
    </div>
@endsection
@push('js')
    @if(request()->get('forgetPasswordToken'))
        <script>
            $('#modal_rest_password').modal('show');
        </script>
    @endif
@endpush
@push('css')
    <style>
        .sonds .sound-details{
            overflow: hidden;
        }
        .addToFavorite, .addToFavorite:focus {
            position: absolute;
            left: -134px;
            width: 142px;
            top: -5px;
            display: flex;
            direction: ltr;
            z-index: 1;
            color: #fff;
            padding: 5px;
            background-color:#FEA107;

            transition: .3s linear;
            justify-content: flex-end;
            align-items: center;
        }
        .addToFavorite > i {
            margin-left: 6px;
            font-size: 23px;
        }
        .addToFavorite::before {
            content: '';
            position: absolute;
            right: -7px;
            top: 25%;
            border-top: 7px solid transparent;
            border-left: 7px solid #FEA107;
            border-bottom: 7px solid transparent;
        }

        .addToFavorite:hover {
            box-shadow: 1px 1px 12px 1px #1e1e1e;
            color: #fff;
            left: -26px;
        }
    </style>
@endpush
