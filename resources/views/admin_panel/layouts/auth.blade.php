<!DOCTYPE html>
<html lang="{{ get_locale() }}" dir="{{ get_locale() =='ar' ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="utf-8" />
    <title>{{ app_name() }} | @stack('page-title')</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="description" content="Latest updates and statistic charts">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700" />
    <link href="{{ asset_admin('plugins/global/plugins.bundle.css') }}" rel="stylesheet" type="text/css" />
    <link href="{{ asset_admin('css/style.bundle.css') }}" rel="stylesheet" type="text/css" />
    @if(get_locale() == 'en')
        <link href="{{ asset_admin('css/custom.css') }}" rel="stylesheet" type="text/css"/>
    @else
        <link href="{{ asset_admin('css/custom-rtl.css') }}" rel="stylesheet" type="text/css"/>
    @endif
        <link rel="shortcut icon" href="{{ isset($data['favicon']) ? $data['favicon'] : '' }}" />
    <style>
        .error-block{
            color: #be3d52;
        }
        .h-60px {
            height: 126px!important;
        }
    </style>
</head>
<body id="kt_body" class="bg-body">
<div class="d-flex flex-column flex-root">
    <div v-cloak id="auth" class="d-flex flex-column flex-lg-row flex-column-fluid" >
        <div class="d-flex flex-column flex-lg-row-auto w-xl-600px positon-xl-relative" style="background-color: #F2C98A">
            <div class="d-flex flex-column position-xl-fixed top-0 bottom-0 w-xl-600px scroll-y">
                <div class="d-flex flex-row-fluid flex-column text-center p-10 pt-lg-20">
                    <a href="" class="py-9 mb-5">
                        <img alt="Logo" src="{{ asset_media('logo','logo.png') }}" class="h-60px" />
                    </a>
                    <h1 class="fw-bolder pb-5 pb-md-10" style="color: #986923;">{{ trans_admin('welcome_to_auth') .' '. app_name()}}</h1>
                </div>
            </div>
        </div>
        <div class="d-flex flex-column flex-lg-row-fluid py-10">
            @yield('content')
        </div>
    </div>
</div>

<script>
    let BASE_URL = '<?php echo e(url_lang('/')); ?>';
    let ADMIN_PREFIX = '<?php echo e(ADMIN_PREFIX); ?>';
    let ADMIN_URL = BASE_URL + '/' + ADMIN_PREFIX;
    let LANG = '<?php echo get_locale() ; ?>';
</script>

<script src="{{ asset_admin('plugins/global/plugins.bundle.js') }}"></script>
<script src="{{ asset_admin('js/scripts.bundle.js') }}"></script>
<script src="{{ asset_admin('js/custom/custom.js') }}" type="text/javascript"></script>
<script src="{{ asset('/js/admin/auth.js') }}?v=old-admin" type="text/javascript"></script>
</body>
</html>
