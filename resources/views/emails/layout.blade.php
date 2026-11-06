<!DOCTYPE html>
<html>
<head>
    <title>@stack('page-title')</title>
    @stack('css')
</head>
<body>
<img src="{{ getSetting('header_logo', true) }}" style="width: 10em;">

<div style="border: 1px solid #ccc!important;
    padding: 1em;
    margin-top: 1em;
    width: 100%;
    border-radius: 15px;">

    <h2 style="color: #3E91D7">@stack('page-title')</h2>
    <p>
        {{trans_emails('layout.hello')}}:
        {{$full_name}}
    </p>

    @yield('content')

    <p>
        {{trans_emails('layout.if_you_have_questions_about_your_account')}}
        <a href="{{ route_app('contactUs.index')}}">{{trans_emails('layout.contact_us')}}</a>
        {{trans_emails('layout.or')}} {{trans_emails('layout.direct_communication_via')}}
        <a href="https://wa.me/{{$data['whatsapp']}}">{{trans_emails('layout.whats_app')}}</a>
    </p>

    <p>{{trans_emails('layout.kind_regard')}}</p>

    <p>{{app_name() .'،'. trans_emails('layout.team')}}</p>
</div>
<p>{{trans_emails('layout.please_dont_reply_to_this_email')}}</p>
</body>
</html>
