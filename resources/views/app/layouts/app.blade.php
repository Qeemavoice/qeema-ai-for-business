<!DOCTYPE html>
<html dir="{{ get_locale() == 'ar' ? 'rtl' : 'ltr' }}" lang="{{ get_locale() }}">
@include('app.layouts.includes.head')
<body>
<div id="app" v-cloak>

    @yield('content')

    <div class="container-fluid mycontiner">
        @isset($enableContactUs)
            @include('app.home.includes.contact-us')
        @endisset

        @include('app.layouts.includes.footer')

        @isset($data['whatsapp'])
        @include('app.layouts.includes.whats-app')
        @endisset

        @include('app.auth.login.login-modal')
        @include('app.auth.login.login-by-google')
        @include('app.auth.register.register-modal')
        @include('app.auth.passwords.forget-modal')
        @include('app.auth.passwords.reset-modal')
        {{--@include('app.home.includes.file-modal')--}}
    </div>

    <div id="sound-notification"></div>
</div>

@include('app.layouts.includes.js')
@include('app.layouts.includes.alert')
</body>
</html>
