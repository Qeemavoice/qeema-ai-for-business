@extends('app.layouts.app')

@push('page-title',meta('page-title'))


@section('content')
    <div class="container contact-us-page">

        @include('app.layouts.includes.nav')
        @include('app.layouts.includes.breadcrumbs')
        @if(isset($banner)&&$banner)
            @include('app.layouts.includes.banner')
        @endif

        <div class="container sounds-step" id="divcategores" style="padding-top: 0;">
            <h3>هنا يمكنك اختيار نوع الأداء الصوتي المطلوب لمشروعك </h3>
            <div class="sounds">
                <div class="row mySounds">
                    @foreach($categories as $category)
                        <a class="col-md-3"
                           href="{{route_app('voice.index',['slug' => $slugVoices,'category' => $category->slug])}}">
                            <div class="item">
                                <div class="icon-item">
                                    <i class="fas fa-{{$category->fontawesome_icon}}"></i>
                                </div>
                                <h4>{{$category->name}}</h4>
                            </div>
                        </a>
                    @endforeach
                </div>
            </div>
        </div>

        @include('app.layouts.includes.faqs')
    </div>
@endsection
