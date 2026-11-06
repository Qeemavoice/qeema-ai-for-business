@extends('app.layouts.app')

@push('page-title',meta('page-title'))


@section('content')
    <div class="container blog-page">

        @include('app.layouts.includes.nav')
        @include('app.layouts.includes.breadcrumbs')
        @if(isset($banner)&&$banner)
            @include('app.layouts.includes.banner')
        @endif

        <div class="row">
            @foreach($guides as $guide)
                <div class="col-md-3 col-lg-3 col-sm-12 book_div">
                    <a href="{{route_app('guide.details.index',['slug' => $guide->slug])}}" class="book d-block mb-3">
                        <div class="book-img">
                            <img src="{{$guide->image_url}}" height="200px" style="object-fit:cover" width="100%" alt="{{$guide->name}}">
                        </div>
                        <div class="book-info">
                            <div class="divider position-relative"></div>
                            <h4 class="book-title font16 main_color mb-2 font-weight-bold" style="font-size:16px">{{$guide->name}}</h4>
                            <div class="d-flex justify-content-around">
                                <p class=" main_color text-center mb-2" style="color: #000 !important"><span style="font-weight:bold">عدد التنزيلات  : {{$guide->number_of_downloads}}</span></p>
                                <p class=" main_color text-center mb-2" style="color: #000 !important"><span style="font-weight:bold ">السعر   : {{$guide->unit_price}}</span></p>
                            </div>
                            @if($guide->evaluation_rate>0)
                                <div class="text-center main_color">
                                    <span style="font-weight:bold ">التقييم : </span>
                                    @for($i=0;$i<$guide->evaluation_rate;$i++)
                                        <i class="fa fa-star" style="color:#FEA107 !important"></i>
                                    @endfor
                                </div>
                            @endif
                        </div>
                    </a>
                </div>
            @endforeach
        </div>

        <div class="row">
            <div class="col-md-12 paging">{!! $guides->render() !!}</div>
        </div>
    </div>
@endsection
