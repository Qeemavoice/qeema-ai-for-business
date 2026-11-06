<nav class="navbar navbar-expand-lg navbar-light">
    <a class="navbar-brand" href="{{route_app('home.index')}}">
        <img src="{{isset($data['header_logo']) ? $data['header_logo'] : logoHeaderApp()}}" width="192" height="89" alt="{{isset($data['alt_header_logo']) ? $data['alt_header_logo'] : ''}}">
    </a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse justify-content-between" id="navbarSupportedContent">
        <ul class="navbar-nav">
            <li class="nav-item {{active_link_sidebar_app('')}}">
                <a class="nav-link" href="{{route_app('home.index')}}">الرئيسية</a>
            </li>
            <li class="nav-item {{active_link_sidebar_app('categories')}}">
                <a class="nav-link" href="{{route_app('category.index',['slug' => $slugCategories])}}">التصنيفات الصوتية</a>
            </li>
            <li class="nav-item has-children {{ active_link_sidebar_app('voices','booking-steps') }}">
                <a class="nav-link " href="javaScript:;"> الأصوات</a>
                <ul class="dropdown arrow-top">
                    <li><a href="{{route_app('voice.index',['slug' => $slugVoices])}}" class="nav-link"> الأصوات</a></li>
                    <li><a href="{{route_app('bookingStep.index',['slug' => $slugBookingSteps])}}" class="nav-link">احجز الصوت</a></li>
                </ul>
            </li>
            <li class="nav-item {{active_link_sidebar_app('guides')}}">
                <a class="nav-link" href="{{route_app('guide.index')}}">الأدلة والمصادر</a>
            </li>
            <li class="nav-item {{active_link_sidebar_app('blog')}}">
                <a class="nav-link" href="{{route_app('blog.index',['slug' => $slugBlogs])}}">المدونة</a>
            </li>
            <li class="nav-item has-children {{active_link_sidebar_app('our-works')}} ">
                <a class="nav-link" href="javaScript:;"> خدماتنا </a>
                <ul class="dropdown arrow-top">
                    <li><a href="{{route_app('ourWork.index',['slug' => $slugOurWorks])}}" class="nav-link">الموشن جرافيك</a></li>
                    <li><a href="{{route_app('page.index',['page' => \App\Models\Page::TRAINING])}}" class="nav-link">التدريب</a></li>
                </ul>
            </li>
            <li class="nav-item has-children">
                <a class="nav-link" href="javaScript:;"><i class="fas fa-ellipsis-h"></i></a>
                <ul class="dropdown arrow-top">
                    @if(isset($data['pages']) && $data['pages']->contains('slug', \App\Models\Page::ABOUT_US))
                        <li><a href="{{route_app('page.index',['page' => \App\Models\Page::ABOUT_US])}}" class="nav-link">من نحن</a></li>
                    @endif
                    <li><a href="{{route_app('career.index')}}" class="nav-link">الوظائف</a></li>
                    <li><a href="{{route_app('contactUs.index',['slug' => $slugContactUs])}}" class="nav-link"> تواصل معنا</a></li>
                </ul>
            </li>
            <li class="nav-item m_mobile">
                <a class="nav-link" target="_blank" href="mailto:{{$data['email']}}">{{$data['email']}}</a>
            </li>
        </ul>
        <div class="form-inline my-2 my-lg-0">
            @auth
                @if(user()->user_type_id !== \App\Models\UserType::ADMIN)
                    <span class="nav-link nav-item has-children" style="margin-left: 0; padding: 0;" title="الصفحة الشخصية ">
                        <span class="nav-icon"><i class="fa fa-user"></i></span>
                        <ul class="dropdown arrow-top dropdown-profile" style="overflow-y: scroll;">
                            @if(user()->user_type_id === \App\Models\UserType::CLIENT)
                                <li><a href="{{route_app('client.profile.index')}}#personal-information" class="nav-link">الصفحة الشخصية</a></li>
                                <li><a href="{{route_app('client.profile.index')}}#work-fields" onclick="navTabList('work-fields')" class="nav-link">مجالات العمل</a></li>
                                <li><a href="{{route_app('client.profile.index')}}#orders" onclick="navTabList('orders')" class="nav-link">الحجوزات</a></li>
                                <li><a href="{{route_app('client.profile.index')}}#favorite" onclick="navTabList('favorite')" class="nav-link">المفضلة</a></li>
                                <li><a href="{{route_app('client.profile.index')}}#notifications" onclick="navTabList('notifications')" class="nav-link">الاشعارات</a></li>
                                <li><a href="{{route_app('client.profile.index')}}#invoices" onclick="navTabList('invoices')" class="nav-link">الفواتير</a></li>
                            @endif

                            @if(user()->user_type_id === \App\Models\UserType::VOICE_ACTOR)
                                <li><a href="{{route_app('voiceActor.profile.index')}}#personal-information" class="nav-link">الصفحة الشخصية </a></li>
                                <li><a href="{{route_app('voiceActor.profile.index')}}#samples" onclick="navTabList('samples')" class="nav-link">العينات</a></li>
                                <li><a href="{{route_app('voiceActor.profile.index')}}#orders" onclick="navTabList('orders')" class="nav-link">الحجوزات</a></li>
                                <li><a href="{{route_app('voiceActor.profile.index')}}#profits" onclick="navTabList('payments')" class="nav-link">المعاملات المالية</a></li>
                                <li><a href="{{route_app('voiceActor.profile.index')}}#notifications" onclick="navTabList('notifications')" class="nav-link">الاشعارات</a></li>
                            @endif

                            <li><a href="{{route_auth('logout')}}" class="nav-link"> {{trans_app('logout')}}  </a></li>
                        </ul>
                    </span>

                    @if(user()->user_type_id === \App\Models\UserType::CLIENT)
{{--                        <a href="{{route_app('client.cart.index')}}" class="position-relative" title="السلة">--}}
{{--                            <span class="badge badge-danger badge-nav badge-cart">1</span>--}}
{{--                            <span class="nav-icon"><i class="fas fa-shopping-cart"></i></span>--}}
{{--                        </a>--}}
                        <notifications></notifications>
                    @endif
                    @if(user()->user_type_id === \App\Models\UserType::VOICE_ACTOR)
{{--                        <a href="{{route_app('voiceActor.profile.index')}}#notifications" id="read_notifications" class="position-relative" title="الإشعارات">--}}
{{--                            <span class="badge badge-danger badge-nav badge-notification">0</span><span class="nav-icon"><i class="fas fa-bell"></i></span>--}}
{{--                        </a>--}}
                        <notifications></notifications>
                    @endif
                @else
                    <a href="{{route_admin('dashboard.index')}}" class="nav-link nav-item has-children" style="margin-left: 0; padding: 0;" title="{{trans_app('dashboard')}}"><span class="nav-icon"><i class="fa fa-columns"></i></span></a>
                    <a style="color: #FEA107;" href="{{route_auth('logout')}}" title="{{trans_app('logout')}}">
                    <span class="nav-icon"><i class="fa fa-sign-out-alt"></i></span></a>
                @endif
            @else
                <a class="nav-link btn_login" data-toggle="modal" data-target="#modal_login" style="color: #FEA107;" href="javaScript:;"> {{trans_app('login')}} </a>
                <a class="nav-link btn_new_registration" data-toggle="modal" data-target="#modal_registration" style="color: #FEA107;" href="javaScript:;"> {{trans_app('register')}} </a>
            @endauth

            @isset($data['whatsapp'])
            <a target="_blank" href="https://wa.me/{{$data['whatsapp']}}"><span class="nav-icon"><i class="fas fa-phone"></i></span></a>
            @endisset
            @isset($data['email'])
            <a target="_blank" href="mailto:{{$data['email']}}"><span class="nav-icon"><i class="fas fa-envelope"></i></span></a>
            @endisset
            <div class="searchbar" style="margin-right: 15px;">
                <form action="">
                    <input type="text" class="search-data form-control" name="search" placeholder="بحث">
                    <div class="icon"><i class="fas fa-search"></i></div>
                </form>
            </div>
        </div>
    </div>
</nav>
