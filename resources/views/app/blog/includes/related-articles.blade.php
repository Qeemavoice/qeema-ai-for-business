<div class="last-news">
    <div class="row">
        <div class="col-12"><h5>{{trans_app('last_articles')}}</h5></div>
    </div>
    <div class="row">
        @foreach($relatedArticles as $article)
            <div class="col-sm-12  col-md-6 col-lg-4">
                <div class="single-col">
                    <a href="{{route_app('blog.details',['slug' => $article->slug])}}">
                        <div class="blog-img">
                            <img src="{{$article->internal_image_url}}" alt="{{$article->title}}">
                        </div>
                    </a>
                    <div class="row">
                        <div class="col-8">
                            <a href="{{route_app('blog.details',['slug' => $article->slug])}}">
                                <span class="name">{{$article->short_description}}</span>
                            </a>
                        </div>
                        <div class="col-4">
                            <span class="date">{{$article->format_y_m_d_created_at}}</span>
                            <span class="read-no">  {{trans_app('reads') }} {{$article->read_count}} </span>
                        </div>
                    </div>
                </div>
            </div>
        @endforeach
    </div>
</div>
