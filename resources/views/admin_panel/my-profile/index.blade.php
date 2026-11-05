@extends('admin_panel.layouts.app')

@push('page-title')
    {{trans_admin('admins')}}
@endpush

@section('content')
    <div>
        @include('admin_panel.my-profile.includes.info-card')

        <div class="card mb-5 mb-xl-10" id="kt_profile_details_view">
            <div class="card-header cursor-pointer">
                <div class="card-title m-0">
                    <h3 class="fw-bolder m-0">{{trans_admin('profile_details')}}</h3>
                </div>
{{--                <a href="{{route_admin('myProfile.edit')}}" class="btn btn-primary align-self-center">Edit Profile</a>--}}
            </div>
            <div class="card-body p-9">
                <div class="row mb-7">
                    <label class="col-lg-4 fw-bold text-muted">{{trans_admin('full_name')}}</label>
                    <div class="col-lg-8">
                        <span class="fw-bolder fs-6 text-gray-800">{{user()->full_name}}</span>
                    </div>
                </div>
                <div class="row mb-7">
                    <label class="col-lg-4 fw-bold text-muted">{{trans_admin('email')}}</label>
                    <div class="col-lg-8 fv-row">
                        <span class="fw-bold text-gray-800 fs-6">{{user()->email}}</span>
                    </div>
                </div>
                @isset(user()->mobile)
                <div class="row mb-7">
                    <label class="col-lg-4 fw-bold text-muted">{{trans_admin('contact_phone')}}
                        <i class="fas fa-exclamation-circle ms-1 fs-7" data-bs-toggle="tooltip" title="" data-bs-original-title="Phone number must be active" aria-label="Phone number must be active"></i></label>
                    <div class="col-lg-8 d-flex align-items-center">
                        <span class="fw-bolder fs-6 text-gray-800 me-2">{{user()->mobile}}</span>
                    </div>
                </div>
                @endisset
                <div class="row mb-7">
                    <label class="col-lg-4 fw-bold text-muted">{{trans_admin('email_verified')}}</label>
                    <div class="col-lg-8">
                        @if(!is_null(user()->email_verified_at))
                            <span class="badge badge-success">{{trans_admin('verified')}}</span>
                        @else
                            <span class="badge badge-warning">{{trans_admin('not_verified')}}</span>
                        @endif
                    </div>
                </div>
                <div class="row mb-7">
                    <label class="col-lg-4 fw-bold text-muted">{{trans_admin('mobile_verified')}}</label>
                    <div class="col-lg-8">
                        @if(!is_null(user()->mobile_verified_at))
                            <span class="badge badge-success">{{trans_admin('verified')}}</span>
                        @else
                            <span class="badge badge-warning">{{trans_admin('not_verified')}}</span>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
