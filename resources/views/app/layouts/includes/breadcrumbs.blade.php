<div class="hero-section page-main-title" style="padding-bottom: 0;">
    <div class="row">
        <div class="col-12">
            <span class="page-title">
                <a href="{{route_app('home.index')}}">الرئيسية -></a>
                 @if(meta('breadcrumbs'))
                    @php $i = 1; @endphp
                    @foreach(meta('breadcrumbs') as $route_name => $title)
                        @php ++$i; @endphp
                        @if($route_name)
                            <a href="{{$route_name}}">{{ $title }}</a>
                        @else
                            <a href="#">{{ $title }}</a>
                        @endif

                        @if(count(meta('breadcrumbs')) == $i)
                            ->
                        @endif
                    @endforeach
                @endif
            </span>
        </div>
        @if(meta('breadcrumbs-title') || meta('breadcrumbs-description'))
            <div class="col-12">
                <div class="sub-page-title" style="text-align: center;">
                    @if(meta('breadcrumbs-title'))
                        <h2>{{ meta('breadcrumbs-title') }}</h2>
                    @endif
                    @if(meta('breadcrumbs-description'))
                        <p>{{meta('breadcrumbs-description')}}</p>
                    @endif
                </div>
            </div>
        @endif
    </div>
</div>


