<div class="container hero-section">
    <div class="row">
        <div class="col-sm-12 col-md-12">
            <div class="single-col">
                @isset($homePageWelcomeSection->video_url)
                <div class="box-video">
                    <div class="video-container">
                        <iframe width="590" height="332" src="{{$homePageWelcomeSection->video_url}}" allowfullscreen="allowfullscreen"></iframe>
                    </div>
                </div>
                @endisset
            </div>
        </div>

        <div class="col-sm-12 col-md-12">
            <div class="single-col hero-title pt-2 text-center pb-5">
                <h1>{{ $homePageWelcomeSection->title->{get_locale()} }}</h1>
                <h2 class="mb-4">{{ $homePageWelcomeSection->short_description->{get_locale()} }}</h2>
                <a href="{{route_app('voice.index',['slug' => $slugVoices])}}">احجز الصوت الآن<i class="lni lni-mic"></i></a>
            </div>
        </div>
    </div>
</div>
