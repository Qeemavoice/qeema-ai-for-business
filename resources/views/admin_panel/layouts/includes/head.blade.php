<head>
    <base href="">
    <title>{{ app_name() }} | @stack('page-title')</title>
    <meta charset="utf-8" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="description" content="" />
    <meta name="keywords" content="" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="" />
    <meta property="og:url" content="" />
    <meta property="og:site_name" content="" />
    <link rel="canonical" href="" />
    <link href="{{isset($data['favicon']) ? $data['favicon'] : favicon()}}" rel="shortcut icon">
{{--    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700" />--}}
    <link href="{{ asset_admin('plugins/global/plugins.bundle.css') }}" rel="stylesheet" type="text/css" />
    <link href="{{ asset_admin('css/style.bundle.css') }}" rel="stylesheet" type="text/css" />

    @if(get_locale() == 'en')
        <link href="{{ asset_admin('plugins/global/plugins.bundle.css') }}" rel="stylesheet" type="text/css" />
        <link href="{{ asset_admin('css/style.bundle.css') }}" rel="stylesheet" type="text/css" />
        <link href="{{ asset_admin('css/custom.css') }}" rel="stylesheet" type="text/css" />
    @else
        <link href="{{ asset_admin('plugins/global/plugins.bundle.rtl.css') }}" rel="stylesheet" type="text/css"/>
        <link href="{{ asset_admin('css/style.bundle.rtl.css') }}" rel="stylesheet" type="text/css"/>
        <link href="{{ asset_admin('css/custom-rtl.css') }}" rel="stylesheet" type="text/css"/>
    @endif

    <link href="{{ asset_admin('css/admin-responsive.css') }}?v={{ filemtime(public_path('admin_panel/assets/css/admin-responsive.css')) }}" rel="stylesheet" type="text/css"/>

    @stack('css')
</head>
