<!--begin::User menu-->
<div class="d-flex align-items-center ms-1 ms-lg-3" id="kt_header_user_menu_toggle">
    <!--begin::Menu wrapper-->
    <div class="cursor-pointer symbol symbol-30px symbol-md-40px" data-kt-menu-trigger="click" data-kt-menu-attach="parent" data-kt-menu-placement="bottom-end">
        <img src="{{user()->image_url}}" alt="user" />
    </div>
    <!--begin::User account menu-->
    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px" data-kt-menu="true">
        <!--begin::Menu item-->
        <div class="menu-item px-3">
            <div class="menu-content d-flex align-items-center px-3">
                <!--begin::Avatar-->
                <div class="symbol symbol-50px me-5">
                    <img alt="Logo" src="{{user()->image_url}}" />
                </div>
                <!--end::Avatar-->
                <!--begin::Username-->
                <div class="d-flex flex-column">
                    <div class="fw-bolder d-flex align-items-center fs-5">{{user()->full_name}}
                        @isset(user()->role)
                        <span class="badge badge-light-success fw-bolder fs-8 px-2 py-1 ms-2">{{user()->role->name}}</span>
                        @endisset
                    </div>
                    <a href="mailto:{{user()->email}}" class="fw-bold text-muted text-hover-primary fs-7">{{user()->email}}</a>
                </div>
                <!--end::Username-->
            </div>
        </div>
        <!--end::Menu item-->
        <!--begin::Menu separator-->
        <div class="separator my-2"></div>
        <!--end::Menu separator-->
        <!--begin::Menu item-->
        <div class="menu-item px-5">
            <a href="{{route_admin('myProfile.index')}}" class="menu-link px-5">{{trans_admin('my_profile')}}</a>
        </div>
        <!--end::Menu item-->
        <!--begin::Menu item-->
{{--        <div class="menu-item px-5">--}}
{{--            <a href="../../demo1/dist/apps/projects/list.html" class="menu-link px-5">--}}
{{--                <span class="menu-text">My Projects</span>--}}
{{--                <span class="menu-badge">--}}
{{--														<span class="badge badge-light-danger badge-circle fw-bolder fs-7">3</span>--}}
{{--													</span>--}}
{{--            </a>--}}
{{--        </div>--}}
        <!--end::Menu item-->
        <!--begin::Menu item-->
{{--        <div class="menu-item px-5" data-kt-menu-trigger="hover" data-kt-menu-placement="left-start">--}}
{{--            <a href="#" class="menu-link px-5">--}}
{{--                <span class="menu-title">My Subscription</span>--}}
{{--                <span class="menu-arrow"></span>--}}
{{--            </a>--}}
{{--            <!--begin::Menu sub-->--}}
{{--            <div class="menu-sub menu-sub-dropdown w-175px py-4">--}}
{{--                <!--begin::Menu item-->--}}
{{--                <div class="menu-item px-3">--}}
{{--                    <a href="../../demo1/dist/account/referrals.html" class="menu-link px-5">Referrals</a>--}}
{{--                </div>--}}
{{--                <!--end::Menu item-->--}}
{{--                <!--begin::Menu item-->--}}
{{--                <div class="menu-item px-3">--}}
{{--                    <a href="../../demo1/dist/account/billing.html" class="menu-link px-5">Billing</a>--}}
{{--                </div>--}}
{{--                <!--end::Menu item-->--}}
{{--                <!--begin::Menu item-->--}}
{{--                <div class="menu-item px-3">--}}
{{--                    <a href="../../demo1/dist/account/statements.html" class="menu-link px-5">Payments</a>--}}
{{--                </div>--}}
{{--                <!--end::Menu item-->--}}
{{--                <!--begin::Menu item-->--}}
{{--                <div class="menu-item px-3">--}}
{{--                    <a href="../../demo1/dist/account/statements.html" class="menu-link d-flex flex-stack px-5">Statements--}}
{{--                        <i class="fas fa-exclamation-circle ms-2 fs-7" data-bs-toggle="tooltip" title="View your statements"></i></a>--}}
{{--                </div>--}}
{{--                <!--end::Menu item-->--}}
{{--                <!--begin::Menu separator-->--}}
{{--                <div class="separator my-2"></div>--}}
{{--                <!--end::Menu separator-->--}}
{{--                <!--begin::Menu item-->--}}
{{--                <div class="menu-item px-3">--}}
{{--                    <div class="menu-content px-3">--}}
{{--                        <label class="form-check form-switch form-check-custom form-check-solid">--}}
{{--                            <input class="form-check-input w-30px h-20px" type="checkbox" value="1" checked="checked" name="notifications" />--}}
{{--                            <span class="form-check-label text-muted fs-7">Notifications</span>--}}
{{--                        </label>--}}
{{--                    </div>--}}
{{--                </div>--}}
{{--                <!--end::Menu item-->--}}
{{--            </div>--}}
{{--            <!--end::Menu sub-->--}}
{{--        </div>--}}
        <!--end::Menu item-->

        <div class="separator my-2"></div>
        <div class="menu-item px-5" data-kt-menu-trigger="hover" data-kt-menu-placement="left-start">
            <a href="#" class="menu-link px-5">
                <span class="menu-title position-relative">{{trans_admin('language')}}
                    <span class="fs-8 rounded bg-light px-3 py-2 position-absolute translate-middle-y top-50 end-0">{{get_locale_text()}}
                        <img class="w-15px h-15px rounded-1 ms-2" src="{{asset_admin('media/flags/'.get_locale().'.svg')}}" alt="" />
                    </span>
                </span>
            </a>
            <div class="menu-sub menu-sub-dropdown w-175px py-4">
                @foreach(languages() as $key => $value)
                <div class="menu-item px-3">
                    <a href="{{ route('change.language',['locale' => $key]) }}" class="menu-link d-flex px-5 {{$key == get_locale() ? 'active' : ''}}">
                        <span class="symbol symbol-20px me-4">
                            <img class="rounded-1" src="{{asset_admin('media/flags/'.$key.'.svg')}}" alt="" />
                        </span>{{$value}}
                    </a>
                </div>
                @endforeach
            </div>
        </div>
        <div class="menu-item px-5 my-1">
            <a href="{{route_admin('myProfile.edit')}}" class="menu-link px-5">{{trans_admin('account_settings')}}</a>
        </div>
        <div class="menu-item px-5">
            <a href="{{ route('auth.admin.logout') }}" class="menu-link px-5">{{ trans_admin('sign_out') }}</a>
        </div>
        <div class="separator my-2"></div>
        <div class="menu-item px-5">
            <div class="menu-content px-5">
                <maintenance-mode :maintenance-mode="`{{getSetting('maintenance_mode')}}`"></maintenance-mode>
            </div>
        </div>
    </div>
</div>


{{--<div class="d-flex align-items-center ms-1 ms-lg-3" id="kt_header_user_menu_toggle">--}}
{{--    <div class="cursor-pointer symbol symbol-30px symbol-md-40px" data-kt-menu-trigger="click" data-kt-menu-attach="parent" data-kt-menu-placement="bottom-end">--}}
{{--        <img src="{{user()->image_url}}" alt="user" />--}}
{{--    </div>--}}
{{--    <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px" data-kt-menu="true">--}}
{{--        <div class="menu-item px-3">--}}
{{--            <div class="menu-content d-flex align-items-center px-3">--}}
{{--                <div class="symbol symbol-50px me-5">--}}
{{--                    <img alt="Logo" src="{{user()->image_url}}" />--}}
{{--                </div>--}}

{{--                <div class="d-flex flex-column">--}}
{{--                    <div class="fw-bolder d-flex align-items-center fs-5">{{user()->full_name}}--}}
{{--                        --}}{{--                                        <span class="badge badge-light-success fw-bolder fs-8 px-2 py-1 ms-2">{{ user()->type->name }}</span></div>--}}
{{--                        --}}{{--                                        <a href="#" class="fw-bold text-muted text-hover-primary fs-7">{{user()->email}}</a>--}}
{{--                    </div>--}}
{{--                </div>--}}
{{--            </div>--}}

{{--            --}}{{--                        <div class="separator my-2"></div>--}}

{{--            --}}{{--                        <div class="menu-item px-5">--}}
{{--            --}}{{--                            <a href="{{route_admin('my_profile.index')}}" class="menu-link px-5">My Profile</a>--}}
{{--            --}}{{--                        </div>--}}


{{--            <div class="separator my-2"></div>--}}

{{--            <div class="menu-item px-5">--}}
{{--                <a href="{{ route('auth.admin.logout') }}" class="menu-link px-5">{{ trans_admin('sign_out') }}</a>--}}
{{--            </div>--}}
{{--        </div>--}}
{{--    </div>--}}
{{--    <div class="d-flex align-items-center d-lg-none ms-2 me-n3" title="Show header menu">--}}
{{--        <div class="btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px" id="kt_header_menu_mobile_toggle">--}}
{{--                            <span class="svg-icon svg-icon-1">--}}
{{--                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">--}}
{{--                                    <path d="M13 11H3C2.4 11 2 10.6 2 10V9C2 8.4 2.4 8 3 8H13C13.6 8 14 8.4 14 9V10C14 10.6 13.6 11 13 11ZM22 5V4C22 3.4 21.6 3 21 3H3C2.4 3 2 3.4 2 4V5C2 5.6 2.4 6 3 6H21C21.6 6 22 5.6 22 5Z" fill="black" />--}}
{{--                                    <path opacity="0.3" d="M21 16H3C2.4 16 2 15.6 2 15V14C2 13.4 2.4 13 3 13H21C21.6 13 22 13.4 22 14V15C22 15.6 21.6 16 21 16ZM14 20V19C14 18.4 13.6 18 13 18H3C2.4 18 2 18.4 2 19V20C2 20.6 2.4 21 3 21H13C13.6 21 14 20.6 14 20Z" fill="black" />--}}
{{--                                </svg>--}}
{{--                            </span>--}}
{{--        </div>--}}
{{--    </div>--}}
{{--</div>--}}
