@extends('admin_panel.layouts.app')

@push('page-title')
    {{$pageTitle}}
@endpush
@section('content')
    <div class="card mb-5 mb-xl-10">
        <div class="card-body pt-9 pb-0">
            @include('admin_panel.voice-actors.details.includes.card')
            @include('admin_panel.voice-actors.details.includes.nav')
        </div>
    </div>
    @include('admin_panel.voice-actors.details.includes.profile-details')
@endsection
