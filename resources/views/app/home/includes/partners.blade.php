<div class="container Success-Partners">
    @if(!empty($titlePartnersSection))
        <h2 class="title">{{$titlePartnersSection->title->{get_locale()} }}</h2>
    @else
        <h2 class="title">شركاء النجاح</h2>
    @endif

    @if(!empty($titlePartnersSection))
        <p>{{$titlePartnersSection->sub_title->{get_locale()} }}</p>
    @else
        <p>آراء عملائنا بجودة خدماتنا</p>
    @endif



    <div class="partner">
        <div class="row">

            @foreach($partners as $partner)
            <div class="col-sm-12 col-md-6 col-lg-6">
                <div class="card wow fadeIn animated" data-wow-delay="1.{{$loop->index}}s" style="visibility: visible;-webkit-animation-delay: 1.{{$loop->index}}s; -moz-animation-delay: 1.{{$loop->index}}s; animation-delay: 1.{{$loop->index}}s;">
                    <img data-src="{{$partner->image_url}}" src="{{$partner->image_url}}" class="card-img-top lazy" alt="{{stringReplace($partner->alt)}}">
                    <div class="card-body">
                        <div class="card-title">
                            <h5 class="">{{$partner->full_name}}</h5>
                            <span>{{$partner->job_title}}</span>
                        </div>
                        <p class="card-text">{{$partner->description}}</p>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
    </div>
</div>

