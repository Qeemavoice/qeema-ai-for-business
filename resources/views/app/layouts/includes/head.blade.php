<head>
    @php
        $defaultMetaDescription = 'قيمة فويس منصة عربية لخدمات التعليق الصوتي والدوبلاج الاحترافي، تضم أصواتًا بشرية متنوعة وخدمات تسجيل صوتي للإعلانات والمحتوى والأعمال.';
        $resolvedMetaDescription = $metaDescription ?? meta('breadcrumbs-description') ?? $defaultMetaDescription;
        $rawLogo = getLogo();
        $socialImage = filter_var($rawLogo, FILTER_VALIDATE_URL) ? $rawLogo : asset($rawLogo);
        $canonicalBaseUrl = meta('canonical') ?: url()->current();
        $canonicalUrl = request()->has('page')
            ? $canonicalBaseUrl . '?page=' . max(1, (int) request('page'))
            : $canonicalBaseUrl;

        $noIndex = request()->is(
            '*/clients/*',
            '*/voice-actors/*',
            '*/orders/*',
            '*/notifications/*',
            '*/chat*',
            '*/password/*'
        );
    @endphp

    <meta charset="utf-8">
    <title> {{ app_name() }} | @stack('page-title') </title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="google-site-verification" content="ANEMdE7bbrZz1XagVGLZYmhwCkCvgbreAOFjoHunhdk"/>

    <meta name="keywords" content="{{$metaKeywords ?? ''}}">
    <meta name="description" content="{{ $resolvedMetaDescription }}">

    <link rel="sitemap" type="application/xml" title="Sitemap" href="{{route('sitemap')}}">

    <meta property="og:url" content="{{ $canonicalUrl }}"/>
    <meta property="og:type" content="{{ request()->is('*/blogs/details/*') ? 'article' : 'website' }}"/>
    <meta property="og:title" content="@stack('page-title')"/>
    <meta property="og:description" content="{{ $resolvedMetaDescription }}"/>
    <meta property="og:image" content="{{ $socialImage }}"/>
    <meta property="og:site_name" content="{{app_name_config()}}"/>

    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:site" content="{{ '@'.app_name_config() }}"/>
    <meta name="twitter:creator" content="{{ '@'.app_name_config() }}"/>
    <meta name="twitter:title" content="@stack('page-title')"/>
    <meta name="twitter:description" content="{{ $resolvedMetaDescription }}"/>
    <meta name="twitter:image" content="{{ $socialImage }}"/>
    <meta name="twitter:domain" content="{{ parse_url(url('/'), PHP_URL_HOST) }}"/>
    <meta name="twitter:url" content="{{ $canonicalUrl }}"/>

    <meta name="robots" content="{{ $noIndex ? 'noindex, nofollow' : 'index, follow' }}">
    <meta name="author" content="{{app_name()}}"/>
    <meta name="rating" content="General"/>
    <link rel="canonical" href="{{ $canonicalUrl }}">
    <meta name="facebook-domain-verification" content="w0c5g67gu0ns3w5ctebj18myfeiqox"/>
    <link rel="icon" type="image/png" href="{{isset($data['favicon']) ? $data['favicon'] : favicon()}}"/>

    @php
        $organizationSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => app_name(),
            'url' => url('/'),
            'logo' => $socialImage,
        ];

        $websiteSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => app_name(),
            'url' => url('/'),
            'inLanguage' => app()->getLocale(),
            'potentialAction' => [
                '@type' => 'SearchAction',
                'target' => url('/' . app()->getLocale() . '/voices') . '?search={search_term_string}',
                'query-input' => 'required name=search_term_string',
            ],
        ];
    @endphp
    <script type="application/ld+json">{!! json_encode($organizationSchema, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES) !!}</script>
    <script type="application/ld+json">{!! json_encode($websiteSchema, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES) !!}</script>
    @stack('structured-data')


    <link rel="stylesheet" href="{{asset_app('css/bootstrap.min.css')}}" type="text/css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.4.1/css/all.min.css">
    {{--<link rel="stylesheet" href="{{asset_app('css/font-awesome.min.css')}}" type="text/css">--}}
    <link rel="stylesheet" href="{{asset_app('css/owl.carousel.min.css')}}" type="text/css">
    <link rel="stylesheet" href="{{asset_app('css/owl.theme.default.min.css')}}" type="text/css">
    <link rel="stylesheet" href="{{asset_app('css/animate.min.css')}}">
    <link rel="stylesheet" href="{{asset_app('css/style_wizard.css')}}" type="text/css">
    <link rel="stylesheet" href="{{asset_app('css/style-rtl.css')}}" type="text/css">
    <link rel="stylesheet" href="{{asset_app('css/jquery.fancybox.min.css')}}" type="text/css">
    @stack('css')
    <style>
        .sound-img {
            width: 100% !important;
            height: 100px !important;
            position: relative !important;
            background-repeat: no-repeat !important;
            background-position: center !important;
            margin: 0 auto !important;
            border-radius:0!important;
        }
        .audio-class {
            margin-right: 1.4rem;
            width: 90%;
        }
    </style>
</head>
