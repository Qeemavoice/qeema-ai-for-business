@extends('app.layouts.app')

@push('page-title',meta('page-title'))

@section('content')
    <div class="container contact-us-page">

        @include('app.layouts.includes.nav')
        @include('app.layouts.includes.breadcrumbs')

        @if(isset($banner)&&$banner)
            @include('app.layouts.includes.banner')
        @endif

        <div class="booking-steps" id="divbooking" style="padding-top: 0;">
            <h2 class="title">{{trans_app('how_booking_voice')}}</h2>
            <h2>{{trans_app('steps_3_the_best')}}</h2>
            <div class="step">
                <div class="row">
                    <div class="col-sm-12 col-md-4 col-lg-4">
                        <section class="wow fadeIn animated booking_step_11" data-wow-delay="0.2s">
                            <div class="steps-img">
                                <img class="step" src="{{asset_app('img/step1.png')}}" alt="احجز معلق صوتي - معلق صوتي محترف - معلق صوتي خبير - توظيف معلق صوتي" >
                                <img class="step step-hover" src="{{asset_app('img/step1-hover.png')}}" alt="احجز معلق صوتي - معلق صوتي محترف - معلق صوتي خبير - توظيف معلق صوتي" style="display: none;">
                            </div>
                        </section>
                    </div>
                    <div class="col-sm-12 col-md-4 col-lg-4">
                        <section class="wow fadeIn animated booking_step_20" data-wow-delay="0.5s">
                            <div class="steps-img">
                                <img class="step" src="{{asset_app('img/step2.png')}}" alt="step2" >
                                <img class="step step-hover" src="{{asset_app('img/step2-hover.png')}}" alt=" احجز معلق صوتي - معلق صوتي محترف - معلق صوتي خبير - توظيف معلق صوتي " style="display: none;" >
                            </div>
                        </section>
                    </div>
                    <div class="col-sm-12 col-md-4 col-lg-4">
                        <section class="wow fadeIn animated booking_step_30" data-wow-delay="0.8s">
                            <div class="steps-img">
                                <img class="step" src="{{asset_app('img/step3.png')}}" alt="step3" >
                                <img class="step step-hover" src="{{asset_app('img/step3-hover.png')}}" alt=" احجز معلق صوتي - معلق صوتي محترف - معلق صوتي خبير - توظيف معلق صوتي" style="display: none;">
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            @isset($faqs)
                <div class='faq'>
                    @foreach ($faqs as $faq)
                        <input id='faq-{{$faq->id}}' type='checkbox'>
                        <label for='faq-{{$faq->id}}' style="margin-bottom: 0;">
                            <p class="faq-heading">{{$faq->title}}</p>
                            <div class='faq-arrow'></div>
                            <p class="faq-text">{{$faq->details}}</p>
                        </label>
                    @endforeach
                </div>
            @endisset
        </div>
    </div>
@endsection



@push('css')
    <style>
        html, body {
            overflow-x: hidden;
        }

        @media(max-width: 767px){
            .banner-img-mobile{
                display:block;
            }
            .banner-img-desktop{
                display:none;
            }
            html, body {
                overflow-x: hidden;
            }
            .faq-heading {
                margin: 14px 20px!important;
            }

        }
        @media(min-width: 768px){
            .banner-img-desktop{
                display:block;
            }
            .banner-img-mobile{
                display:none;
            }
            html, body {
                overflow-x: hidden;
            }

            body {
                font-size: 14px;
                line-height: 1.6;
            }
            .faq-heading {
                margin: 14px 20px!important;
            }
        }
        .faq-heading {
            font-weight: 400;
            font-size: 19px;
            -webkit-transition: text-indent 0.2s;
            text-indent: 20px;
            color: #333;
            margin: 10px 20px;
        }
        .faq-text {
            font-weight: 400;
            color: #919191;
            width:100%;
            padding-left:20px;
            margin-bottom:30px;
        }
        .faq {
            width: 100%;
            margin: 0 auto;
            background: white;
            border-radius: 4px;
            position: relative;
            border: 1px solid #E1E1E1;
        }
        .faq label {
            display: block;
            position: relative;
            overflow: hidden;
            cursor: pointer;
            height: 56px;
            padding-top:1px;

            background-color: #FAFAFA;
            border-bottom: 1px solid #E1E1E1;
        }
        .faq input[type="checkbox"] {
            display: none;
        }
        .faq .faq-arrow {
            width: 5px;
            height: 5px;
            transition: -webkit-transform 0.8s;
            transition: transform 0.8s;
            transition: transform 0.8s, -webkit-transform 0.8s;
            -webkit-transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
            border-top: 2px solid rgba(0, 0, 0, 0.33);
            border-right: 2px solid rgba(0, 0, 0, 0.33);
            float: right;
            position: relative;
            top: -30px;
            right: 27px;
            -webkit-transform: rotate(45deg);
            transform: rotate(45deg);
        }
        .faq input[type="checkbox"]:checked + label > .faq-arrow {
            transition: -webkit-transform 0.8s;
            transition: transform 0.8s;
            transition: transform 0.8s, -webkit-transform 0.8s;
            -webkit-transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
            -webkit-transform: rotate(135deg);
            transform: rotate(135deg);
        }
        .faq input[type="checkbox"]:checked + label {
            display: block;
            background: rgba(255,255,255,255) !important;
            color: #4f7351;
            height: auto;
            transition: height 0.8s;
            -webkit-transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .faq input[type='checkbox']:not(:checked) + label {
            display: block;
            transition: height 0.8s;
            height: 60px;
            -webkit-transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        ::-webkit-scrollbar {
            display: none;
        }
    </style>
@endpush
