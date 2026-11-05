<head>
    <meta charset="utf-8">
    <title> {{ app_name() }} | @stack('page-title') </title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">

    <meta name="keywords" content="">
    <meta name="image" content=""/>
    <link rel="sitemap" type="application/xml" title="Sitemap" href="http://qeemavoice.test/sitemap.xml">
    <meta property="og:url" content="http://qeemavoice.test"/>
    <meta property="og:type" content="article"/>
    <meta property="og:title" content="قيمة فويس  "/>
    <meta property="og:description" content=" منصة قيمة فويس, أكبر منصة عربية لخدمات التعليق الصوتي، فويس اوفر، دوبلاج صوتي. احجز الآن من بينِ عشرات المعلقين الصوتيين المحترفين على مستوى الوطن العربي. "/>
    <meta property="og:image" content="http://qeemavoice.test/uploads/454/6vaA4ri0dlkQf6L1678868403.png"/>
    <meta property="og:site_name" content="قيمة فويس "/>
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:site" content="@Qeemavoice"/>
    <meta name="twitter:creator" content="@Qeemavoice"/>
    <meta name="twitter:title" content="قيمة فويس  "/>
    <meta name="twitter:description" content=" منصة قيمة فويس, أكبر منصة عربية لخدمات التعليق الصوتي، فويس اوفر، دوبلاج صوتي. احجز الآن من بينِ عشرات المعلقين الصوتيين المحترفين على مستوى الوطن العربي. "/>
    <meta name="twitter:image" content="http://qeemavoice.test/uploads/454/6vaA4ri0dlkQf6L1678868403.png"/>
    <meta name="twitter:domain" content="http://qeemavoice.test"/>
    <meta name="twitter:url" content="http://qeemavoice.test"/>
    <meta property="og:url" content="http://qeemavoice.test"/>
    <meta property="og:title" content="قيمة فويس  "/>
    <meta property="og:description" content=" منصة قيمة فويس, أكبر منصة عربية لخدمات التعليق الصوتي، فويس اوفر، دوبلاج صوتي. احجز الآن من بينِ عشرات المعلقين الصوتيين المحترفين على مستوى الوطن العربي. "/>
    <meta property="og:image" content="http://qeemavoice.test/uploads/454/6vaA4ri0dlkQf6L1678868403.png"/>
    <meta name="robots" content="ALL, INDEX, FOLLOW"/>
    <meta name="author" content="Qeemavoice"/>
    <meta name="rating" content="General"/>
    <link rel="canonical" href="https://qeemavoice.com">
    <meta name="facebook-domain-verification" content="w0c5g67gu0ns3w5ctebj18myfeiqox"/>
    <link rel="icon" type="image/png" href="{{isset($data['favicon']) ? $data['favicon'] : favicon()}}"/>

    <link rel="stylesheet" href="{{asset_app('css/bootstrap.min.css')}}" type="text/css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.4.1/css/all.min.css">
    {{--    <link rel="stylesheet" href="{{asset_app('css/font-awesome.min.css')}}" type="text/css">--}}
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
