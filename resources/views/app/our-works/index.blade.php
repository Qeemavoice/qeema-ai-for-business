@extends('app.layouts.app')

@push('page-title',meta('page-title'))

@section('content')
    <div class="container contact-us-page  sound-page">
        @include('app.layouts.includes.nav')
        @include('app.layouts.includes.breadcrumbs')
        @if(isset($banner)&&$banner)
            @include('app.layouts.includes.banner')
        @endif
        <div class="container-fluid mycontiner  sooo">
            <div class="container">
                <div>
                    <h1>اطلع على أعمالنا الصوتية</h1>
                    <div class="sonds cnt">
                        <div class="row"  id="post-data">
                            @foreach($works as $work)
                                <div class="col-sm-12 col-md-6 col-lg-4">
                                    <div class="video-item">
                                        <div class="box-video">
                                            <div class="video-container">
                                                <iframe width="395" height="270" src="{{$work->url}}" allowfullscreen="allowfullscreen"></iframe>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
