<!DOCTYPE html>
<html lang="{{get_locale()}}" dir="{{get_locale() == 'ar' ? 'rtl' : 'ltr'}}" style="direction: {{get_locale() == 'ar' ? 'rtl' : 'ltr'}}">
@include('admin_panel.layouts.includes.head')

<body id="kt_body" class="header-fixed header-tablet-and-mobile-fixed toolbar-enabled toolbar-fixed aside-enabled aside-fixed" style="--kt-toolbar-height:55px;--kt-toolbar-height-tablet-and-mobile:55px">

<div class="d-flex flex-column flex-root">
    <div class="page d-flex flex-row flex-column-fluid">
        <div id="kt_aside" class="aside aside-dark aside-hoverable" data-kt-drawer="true" data-kt-drawer-name="aside" data-kt-drawer-activate="{default: true, lg: false}" data-kt-drawer-overlay="true" data-kt-drawer-width="{default:'200px', '300px': '250px'}" data-kt-drawer-direction="start" data-kt-drawer-toggle="#kt_aside_mobile_toggle">
            <div class="aside-logo flex-column-auto" id="kt_aside_logo">
                <a href="{{ route_admin('dashboard.index') }}">
                    <img alt="Logo" src="{{logoHeaderAdmin()}}" class="h-25px logo"  />
                </a>
                <div id="kt_aside_toggle" class="btn btn-icon w-auto px-0 btn-active-color-primary aside-toggle" data-kt-toggle="true" data-kt-toggle-state="active" data-kt-toggle-target="body" data-kt-toggle-name="aside-minimize">
                    <span class="svg-icon svg-icon-1 rotate-180">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path opacity="0.5" d="M14.2657 11.4343L18.45 7.25C18.8642 6.83579 18.8642 6.16421 18.45 5.75C18.0358 5.33579 17.3642 5.33579 16.95 5.75L11.4071 11.2929C11.0166 11.6834 11.0166 12.3166 11.4071 12.7071L16.95 18.25C17.3642 18.6642 18.0358 18.6642 18.45 18.25C18.8642 17.8358 18.8642 17.1642 18.45 16.75L14.2657 12.5657C13.9533 12.2533 13.9533 11.7467 14.2657 11.4343Z" fill="black" />
                            <path d="M8.2657 11.4343L12.45 7.25C12.8642 6.83579 12.8642 6.16421 12.45 5.75C12.0358 5.33579 11.3642 5.33579 10.95 5.75L5.40712 11.2929C5.01659 11.6834 5.01659 12.3166 5.40712 12.7071L10.95 18.25C11.3642 18.6642 12.0358 18.6642 12.45 18.25C12.8642 17.8358 12.8642 17.1642 12.45 16.75L8.2657 12.5657C7.95328 12.2533 7.95328 11.7467 8.2657 11.4343Z" fill="black" />
                        </svg>
                    </span>
                </div>
            </div>

            @include('admin_panel.layouts.includes.sidebar')

        </div>

        <div class="wrapper d-flex flex-column flex-row-fluid" id="admin" v-cloak>

            @include('admin_panel.layouts.includes.header')

            <div class="content d-flex flex-column flex-column-fluid" id="kt_content" >
                <div class="toolbar" id="kt_toolbar">
                    <div id="kt_toolbar_container" class="container-fluid d-flex flex-stack">
                        @include('admin_panel.layouts.includes.breadcrumbs')

                    </div>
                </div>

                <div class="post d-flex flex-column-fluid" id="kt_post">
                    <div id="kt_content_container" class="container-xxl">
                        @yield('content')
                    </div>
                </div>
            </div>

            @include('admin_panel.layouts.includes.footer')
        </div>
    </div>
</div>

<div id="kt_scrolltop" class="scrolltop" data-kt-scrolltop="true">
    <span class="svg-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect opacity="0.5" x="13" y="6" width="13" height="2" rx="1" transform="rotate(90 13 6)" fill="black" />
            <path d="M12.5657 8.56569L16.75 12.75C17.1642 13.1642 17.8358 13.1642 18.25 12.75C18.6642 12.3358 18.6642 11.6642 18.25 11.25L12.7071 5.70711C12.3166 5.31658 11.6834 5.31658 11.2929 5.70711L5.75 11.25C5.33579 11.6642 5.33579 12.3358 5.75 12.75C6.16421 13.1642 6.83579 13.1642 7.25 12.75L11.4343 8.56569C11.7467 8.25327 12.2533 8.25327 12.5657 8.56569Z" fill="black" />
        </svg>
    </span>
</div>
<div id="loading-div" class="loading" style="display: block;">
    <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
    <span class="sr-only">{{ trans('admin_panel.loading') }}...</span>
</div>
<script>
    let ROOT_URL = '<?php echo e(url('/')); ?>';
    let BASE_URL = '<?php echo e(url_lang('/')); ?>';
    let ADMIN_PREFIX = '<?php echo e(ADMIN_PREFIX); ?>';
    let ADMIN_URL = BASE_URL + '/' + ADMIN_PREFIX;
    let TOKN = '{{ csrf_token() }}';
    let USER = {!! auth()->check() ? user() : 'null' !!};
    let LANGUAGES = '<?php echo json_encode(languages()) ; ?>';
    let COMMISSIONS = '<?php echo json_encode(commissions()) ; ?>';
    let LANG = '<?php echo get_locale() ; ?>';
</script>
@stack('before_js')

<script>var hostUrl = "assets/";</script>
<script src="{{ asset_admin('plugins/global/plugins.bundle.js') }}"></script>
<script src="{{ asset_admin('js/custom/custom.js') }}"></script>
<script src="{{ asset_admin('js/scripts.bundle.js') }}"></script>
{{--@stack('js_module')--}}
<script src="{{asset('system/js/fee.js')}}"></script>
<script src="{{ asset('js/admin/admin.js') }}" type="text/javascript"></script>
@stack('js')

</body>
</html>
