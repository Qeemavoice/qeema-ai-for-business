@extends('emails.layout')

@push('page-title',$title)

@section('content')
    <p>{!! trans_emails('welcome_user.content',['url' => route_app('voice.index')]) !!}</p>
@endsection
