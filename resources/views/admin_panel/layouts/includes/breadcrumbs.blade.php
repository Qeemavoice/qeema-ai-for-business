@if(meta('breadcrumbs-title') || meta('breadcrumbs'))
    <div data-kt-swapper="true" data-kt-swapper-mode="prepend" data-kt-swapper-parent="{default: '#kt_content_container', 'lg': '#kt_toolbar_container'}" class="page-title d-flex align-items-center flex-wrap me-3 mb-5 mb-lg-0">
        @if(meta('breadcrumbs-title'))
            <h1 class="d-flex text-dark fw-bolder fs-3 align-items-center my-1">{{ meta('breadcrumbs-title') }}</h1>
        @endif
        @if(meta('breadcrumbs'))
            <span class="h-20px border-gray-300 border-start mx-4"></span>
            <ul class="breadcrumb breadcrumb-separatorless fw-bold fs-7 my-1">

                <li class="breadcrumb-item text-muted">
                    <a href="{{ route_admin('dashboard.index') }}" class="text-muted text-hover-primary">{{ trans_admin('dashboard') }}</a>
                </li>
                <li class="breadcrumb-item"><span class="bullet bg-gray-300 w-5px h-2px"></span></li>
                @php $i = 1; @endphp
                @foreach(meta('breadcrumbs') as $route_name => $title)
                    @php ++$i; @endphp
                    @if($route_name)
                        <li class="breadcrumb-item"><a href="{{$route_name}}" class="text-muted text-hover-primary">{{ $title }}</a></li>
                    @else
                        <li class="breadcrumb-item text-dark">{{ $title }}</li>
                    @endif
                    @if(count(meta('breadcrumbs')) == $i)
                        <li class="breadcrumb-item">
                            <span class="bullet bg-gray-300 w-5px h-2px"></span>
                        </li>
                    @endif
                @endforeach
            </ul>
        @endif
    </div>

@endif
