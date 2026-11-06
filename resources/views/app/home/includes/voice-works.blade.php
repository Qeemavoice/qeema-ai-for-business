<div class="container our-works" id="navworks">
    @if(!empty($titleWorksSetting))
        <h2 class="title">{{$titleWorksSetting}}</h2>
    @else
        <h2 class="title">أعمال صوتية نفتخر بها</h2>
    @endif
    @if(!empty($subTitleWorksSetting))
        <h3>{{$subTitleWorksSetting}} </h3>
    @else
        <h3>شاهد كيف يخرج العمل الصوتي بشكله النهائي</h3>
    @endif
    <div class="row">
        @foreach($ourWorks as $work)
        <div class="col-sm-12 col-md-6 col-lg-4">
            <div class="video-item">
                <div class="box-video">
                    <div class="video-container" style="height:100%">
                        <iframe width="395" height="270" class="lazy"  src="{{$work->url}}" data-src="{{$work->url}}" allowfullscreen="allowfullscreen"></iframe>
                    </div>
                </div>
            </div>
        </div>
        @endforeach
    </div>
    <div class="row">
        <div class="col-12">
            <div class="listen-more">
                <a target="_blank" href="{{route_app('ourWork.index',['slug' => $slugOurWorks])}}">شاهد المزيد</a>
            </div>
        </div>
    </div>
</div>
