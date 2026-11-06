@extends('app.layouts.app')

@push('page-title',meta('page-title'))


@section('content')
    <div class="container contact-us-page">
        @include('app.layouts.includes.nav')
        @include('app.layouts.includes.breadcrumbs')
        @if(isset($banner)&&$banner)
            @include('app.layouts.includes.banner')
        @endif
        <div class="main-contact-form">
            <div class="row">
                <div class="col-sm-12 col-md-12 col-lg-7">
                    <div class="single-col white-bg">
                        <h4>{{trans_app('fill_in_the_contact_info')}}</h4>
                        <span>{{trans_app('contact_you_within')}} </span>
                        <contact-us-form inline-template>
                            <form id="contactus" method="POST" role="form" class="formContact contactForm Contact" v-loading="form.loadingDisplay">
                                <div class="form-group">
                                    <label for="name">{{trans_app('name')}}</label>
                                    <input type="text" class="form-control" id="title" placeholder="أدخل الاسم الذي تريد التواصل به" name="title">
                                    <span v-if="form.validation && form.validation.name" class="error-block">@{{ form.validation.name[0] }}</span>
                                </div>
                                <div class="form-group">
                                    <label for="email">{{trans_app('email')}}</label>
                                    <input type="email" name="email" class="form-control" id="email" placeholder="info@email.com">
                                    <span v-if="form.validation && form.validation.email" class="error-block">@{{ form.validation.email[0] }}</span>
                                </div>
                                <div class="form-group">
                                    <label for="messge">{{trans_app('message')}}</label>
                                    <textarea id="content" name="content" rows="3" class="form-control"></textarea>
                                    <span v-if="form.validation && form.validation.message" class="error-block">@{{ form.validation.message[0] }}</span>
                                </div>
                                <button type="button" @click="save" :disabled="form.disabledButton"  class="btn btn-primary">{{trans_app('sent')}}</button>
                            </form>
                        </contact-us-form>

                    </div>
                </div>
                <div class="col-sm-12 col-md-12 col-lg-5">
                    <div class="single-col orange-bg">
                        <h4>{{trans_app('contact_info')}}</h4>
                        <ul class="contact-info-list">
                            @isset($data['email'])
                            <li><i class="far fa-envelope"></i><span>{{$data['email']}}</span></li>
                            @endisset
                            <li><i class="fas fa-globe"></i><span>{{route_app('home.index')}}</span></li>
                        </ul>
                        <ul class="social-link">
                            @isset($data['whatsapp'])
                                <li><a target="_blank" href="https://wa.me/{{$data['whatsapp']}}"><i class="fab fa-whatsapp"></i></a></li>
                            @endisset

                            @isset($data['instagram'])
                                <li><a target="_blank" href="{{$data['instagram']}}"><i class="fab fa-instagram"></i></a></li>
                            @endisset

                            @isset($data['facebook'])
                                <li><a target="_blank" href="{{$data['facebook']}}"><i class="fab fa-facebook-f"></i></a></li>
                            @endisset

                            @isset($data['linkedin'])
                                <li><a target="_blank" href="{{$data['linkedin']}}"><i class="fab fa-linkedin-in"></i></a></li>
                            @endisset

                            @isset($data['twitter'])
                                <li><a target="_blank" href="{{$data['twitter']}}"><i class="fab fa-twitter"></i></a></li>
                            @endisset

                            @isset($data['youtube'])
                                <li><a target="_blank" href="{{$data['youtube']}}"><i class="fab fa-youtube"></i></a></li>
                            @endisset
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
