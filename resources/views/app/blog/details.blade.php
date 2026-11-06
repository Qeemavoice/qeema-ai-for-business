@extends('app.layouts.app')

@push('page-title',meta('page-title'))


@section('content')
    <div class="container blog-page">
        @include('app.layouts.includes.nav')
        @include('app.layouts.includes.breadcrumbs')

        <div class="main-blog">
            <div class="row">
                <div class="col-12">
                    <div class="blog-bg">
                        @if($article->video_url)
                            <iframe  width="100%" height="100%" src="{{$article->video_url}}" frameborder="0" allowfullscreen="allowfullscreen"></iframe>
                        @else
                            @if($article->external_image)
                                <img src="{{$article->external_image_url}}" style="object-fit:cover" alt="{{$article->title}}">
                            @endif
                        @endif
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <div class="blog-deatails">
                        {!! $article->content !!}
                    </div>
                </div>
                <div class="col-12">
                    <div class="blog-share">
                        <h6>{{trans_app('share')}}</h6>
                        <ul class="social-link">
                            <li><i class="fas fa-share-alt"></i></li>
                            <li><a target="_blank" href="https://wa.me/?text={{url()->current()}}" class="social-button " id="" title="{{$article->title}}" rel=""><i class="fab fa-whatsapp"></i></a></li>
                            <li><a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u={{url()->current()}}" class="social-button " id="" title="{{$article->title}}" rel=""><i class="fab fa-facebook-f"></i></a></li>
                            <li><a target="_blank" href="https://www.linkedin.com/sharing/share-offsite?mini=true&amp;url={{url()->current()}}&amp;title={{$article->title}}&amp;summary=" class="social-button " id="" title="" rel=""><i class="fab fa-linkedin-in"></i></a></li>
                            <li><a target="_blank" href="https://twitter.com/intent/tweet?text={{$article->title}}&amp;url={{url()->current()}}" class="social-button " id="" title="{{$article->title}}" rel=""><i class="fab fa-twitter"></i></a></li>
                        </ul>
{{--                        {!! Share::page(url()->current(), $article->title, [], '<ul class="social-link">', '</ul>')--}}
{{--                    ->telegram()--}}
{{--                    ->whatsapp()--}}
{{--                    ->facebook()--}}
{{--                    ->linkedin()--}}
{{--                    ->twitter()--}}
{{--                     !!}--}}
                    </div>
                </div>
            </div>
        </div>

        @include('app.blog.includes.related-articles')
    </div>
@endsection
