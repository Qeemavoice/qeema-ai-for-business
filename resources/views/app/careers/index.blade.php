@extends('app.layouts.app')

@push('page-title',meta('page-title'))


@section('content')
    <div class="container blog-page">
        @include('app.layouts.includes.nav')
        @include('app.layouts.includes.breadcrumbs')
        @if(isset($banner)&&$banner)
            @include('app.layouts.includes.banner')
        @endif
        <div class="row pricing mb-4">

            @if(count($jobs) > 0 )
            @foreach($jobs as $job)
                <div class="col-md-3 col-lg-3 col-sm-12 book_div">
                    <a href="{{route_app('career.details',['slug' => $job->slug])}}" class="book d-block mb-3">
                        <div class="book-img"><img src="{{$job->external_image_url}}" height="200px" style="object-fit:cover" width="100%" alt=""></div>
                        <div class="book-info">
                            <div class="divider position-relative"></div>
                            <h4 class="book-title font16 main_color mb-2 font-weight-bold" style="font-size:16px">{{$job->title}}</h4>
                            <div class="d-flex justify-content-around">
                                @isset($job->type)
                                <p class=" main_color text-center mb-2" style="color: #000 !important"><span style="font-weight:bold">طبيعة العمل :  {{$job->show_type}} </span></p>
                                @endisset
                                <p class=" main_color text-center mb-2" style="color: #000 !important"><span style="font-weight:bold "> طبيعة الدوام  :  {{$job->show_workplace_type}} </span></p>
                            </div>
                        </div>
                    </a>
                </div>
            @endforeach
            @else
                <div class="alert alert-warning" style="width:100%">لا توجد وظائف متاحة حاليا</div>
            @endif
        </div>
    </div>
@endsection
