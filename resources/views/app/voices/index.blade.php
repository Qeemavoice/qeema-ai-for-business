@extends('app.layouts.app')

@push('page-title',meta('page-title'))


@section('content')
    <div class="container sound-page">
        @include('app.layouts.includes.nav')
        @include('app.layouts.includes.breadcrumbs')
        @if(isset($banner)&&$banner)
            @include('app.layouts.includes.banner')
        @endif
    </div>

    <voices-search :category="`{{request()->category}}`" inline-template>
        <div class="container-fluid mycontiner  sooo mt-5" v-loading="form.loadingDisplay">
            @include('app.voices.includes.header')
            @include('app.voices.includes.sounds')


        </div>
    </voices-search>

@endsection
@push('css')
    <style>
        .sonds .sound-details{
            overflow: hidden;
        }
        .addToFavorite, .addToFavorite:focus {
            position: relative!important;
            right: 0 !important;
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
            margin-bottom: 1rem!important;
        }
        .addToFavorite > i {
            margin-left: 6px;
            font-size: 23px;
        }
        /*.addToFavorite::before {*/
        /*    content: '';*/
        /*    position: absolute;*/
        /*    right: -7px;*/
        /*    top: 25%;*/
        /*    border-top: 7px solid transparent;*/
        /*    border-left: 7px solid #FEA107;*/
        /*    border-bottom: 7px solid transparent;*/
        /*}*/
        .addToFavorite:hover {
            box-shadow: 1px 1px 12px 1px #1e1e1e;
            color: #fff;
        /*   left: -26px;*/
       }


       @media (max-width: 767px){
           .hero-section {
               padding-bottom: 0;
           }
       }
@isset($voicesPageSetting->background)
        .page-header {
            background: url('{{$voicesPageSetting->background->url}}')!important;
        }
        @endisset
    </style>
@endpush
