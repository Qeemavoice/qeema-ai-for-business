@extends('emails.layout')

@push('page-title',trans('app.title_password_reset_request'))

@section('content')
    <p>{{ trans('app.password_reset_request') }}</p>

    @if($isAdmin)
        <a href="{{ route_admin('password.reset',['token' => $token,'isAdmin' => true]) }}" style="color: #fff !important;
    background-color: #3E91D7;
    border-color: #3E91D7;     border-radius: 4px;
    font-weight: 500;
    padding: 11px 10px;
    transition: 0.5s;">{{ trans('auth.link') }}</a>
    @else
        <a href="{{ route_app('home.index',['forgetPasswordToken' => $token]) }}" style="color: #fff !important;
    background-color: #3E91D7;
    border-color: #3E91D7;     border-radius: 4px;
    font-weight: 500;
    padding: 11px 10px;
    transition: 0.5s;">{{ trans('auth.link') }}</a>
    @endif
@endsection
