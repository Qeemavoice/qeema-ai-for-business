@extends('app.layouts.app')

@push('page-title',meta('page-title'))


@section('content')
    <div class="container blog-page faq">
        @include('app.layouts.includes.nav')

        <div class="hero-section page-main-title">
            @include('app.layouts.includes.breadcrumbs')
            @if(isset($banner)&&$banner)
                @include('app.layouts.includes.banner')
            @endif
            <br>
            <div class="row">
                <div class="col-md-12">
                    <h1 class=""> آلية عمل منصة قيمة فويس للخدمات الصوتية </h1>
                </div>
                <div class="col-md-12">
                    <div class="accordion mt-5" id="accordionExample">
                        <div class="row">
                            @foreach($faqs as $faq)
                            <div class="col-xl-6 col-lg-6">
                                <div class="card">
                                    <div class="card-header">
                                        <h5 class="mb-0">
                                            <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapse{{$faq->id}}" aria-expanded="false" aria-controls="collapse{{$faq->id}}">{{$faq->title}}</button>
                                        </h5>
                                    </div>

                                    <div id="collapse{{$faq->id}}" class="collapse" data-parent="#accordionExample">
                                        <div class="card-body">
                                           {{$faq->details}}
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
