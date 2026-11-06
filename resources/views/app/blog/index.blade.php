@extends('app.layouts.app')

@push('page-title',meta('page-title'))
@push('css')
    <style>
        @media (max-width: 767px){
            .blog-page .hero-section {
                padding-bottom: 0;
            }

            html, body {
                overflow-x: hidden;
            }
        }
        .blog-deatails input[type="button"] span, .blog-deatails a span{
            color:#fff !important;
        }
        @media (max-width: 767px){
            .blog-deatails input[type="button"], .blog-deatails a{
                display:block;
                margin: 8px 0;
            }
            body .main-blog .blog-bg {
                height: auto !important;
            }
            body .blog-page .hero-section {
                padding-bottom: 0px;
            }

            html, body {
                overflow-x: hidden;
            }
        }
        @media (min-width: 1349px){
            .blog-page .main-blog .blog-deatails {
                width: 80%;
                margin: 0 auto;
            }
            html, body {
                overflow-x: hidden;
            }
        }
        .blog-deatails input[type="button"],.blog-deatails a{
            background: #FEA107 !important;
            color: #fff !important;
            padding: 8px;
            border: none !important;
            border-radius: 5px;
            cursor: pointer;
        }
        body .main-blog .blog-bg img{
            height:auto;
        }
        .main-blog .blog-bg{
            height:auto !important;
        }

        @media (max-width: 767px){
            .blog-deatails img,.blog-deatails iframe{
                width:100%;
            }

            html, body {
                overflow-x: hidden;
            }
        }
    </style>
@endpush

@section('content')
    <div class="container blog-page">

        @include('app.layouts.includes.nav')
        @include('app.layouts.includes.breadcrumbs')
        @if(isset($banner)&&$banner)
            @include('app.layouts.includes.banner')
        @endif


        <div class="last-news">
            <div class="row mb-30">
                <div class="col-sm-12 col-md-6"><h5> {{trans_app('articles')}} </h5></div>

            </div>
            <div class="row" id="post-data">
                @isset($articles)
                @foreach($articles as $article)
                    <div class="col-sm-12  col-md-6 col-lg-4" id="hoverist">
                        <div class="single-col" >
                            <a href="{{route_app('blog.details',['slug' => $article->slug])}}">
                                <div class="blog-img"><img src="{{$article->external_image_url}}" alt="{{$article->title}}"></div>
                            </a>
                            <div class="row">
                                <div class="col-8">
                                    <a href="{{route_app('blog.details',['slug' => $article->slug])}}"><span class="name">{{ mb_substr($article->short_description, 0, 50) }}...</span></a>
                                </div>
                                <div class="col-4">
                                    <span class="date">{{$article->format_y_m_d_created_at}}</span>
                                    <span class="read-no"> {{$article->read_count ? : 0}} {{trans_app('reads')}}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                @endforeach
                    <div class="col-12 mt-4">
                        <div class="paginaition_class text-center mt-3">
                            {!! $articles->render() !!}
                        </div>
                    </div>
                @endisset
            </div>
        </div>
    </div>
@endsection
