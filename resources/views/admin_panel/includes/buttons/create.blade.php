<a href="{{route_admin($asRoute.'.create')}}" class="btn btn-sm btn-primary">
    <span class="svg-icon svg-icon-2">
        <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <rect fill="black" height="2" opacity="0.5" rx="1" transform="rotate(-90 11.364 20.364)" width="16" x="11.364" y="20.364"/>
            <rect fill="black" height="2" rx="1" width="16" x="4.36396" y="11.364"/>
        </svg>
    </span>
    @isset($label)
        {{$label}}
    @else
    {{trans_admin('add_new')}}
    @endif
</a>
