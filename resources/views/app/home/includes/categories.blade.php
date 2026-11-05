<div class="container sounds-step" id="divcategores">
    @if(!empty($titleCategoriesSetting))
        <h2 class="title">{{$titleCategoriesSetting}}</h2>
    @else
        <h2 class="title">التصنيفات الصوتية</h2>
    @endif
    @if(!empty($subTitleCategoriesSetting))
        <h3>{{$subTitleCategoriesSetting}} </h3>
    @else
        <h3>هنا يمكنك اختيار نوع الأداء الصوتي المطلوب لمشروعك </h3>
    @endif
    <div class="sounds">
        <div class="owl-carousel owl-theme mySounds">
            @foreach($data['categories'] as $category)
            <a href="{{route_app('voice.index',['slug' => $slugVoices,'category' => $category->slug])}}">
                <div class="item">
                    <div class="icon-item"><i class="fas fa-{{$category->fontawesome_icon}}"></i></div>
                    <h4>{{$category->name}}</h4>
                </div>
            </a>
            @endforeach

        </div>
    </div>
</div>
