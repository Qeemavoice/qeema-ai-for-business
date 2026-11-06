@extends('admin_panel.layouts.app')

@push('page-title')
    {{ meta('breadcrumbs-title') }}
@endpush

@section('content')
    <home-page :settings="{{isset($settings) ? $settings->toJson() : ''}}" inline-template>
        <div>
            @include('admin_panel.appearance.home-page.includes.tabs')
            <div class="row g-xxl-12">
                <div class="col-xxl-12">
                    <div class="card card-xxl-stretch mb-5 mb-xl-10">
                        <div class="tab-content">
                            @include('admin_panel.appearance.home-page.includes.welcome-section')
                            @include('admin_panel.appearance.home-page.includes.booking-steps-section')
                            @include('admin_panel.appearance.home-page.includes.categories-section')
                            @include('admin_panel.appearance.home-page.includes.voices-section')
                            @include('admin_panel.appearance.home-page.includes.works-section')
                            @include('admin_panel.appearance.home-page.includes.clients-section')
                            @include('admin_panel.appearance.home-page.includes.partners-section')
                            @include('admin_panel.appearance.home-page.includes.faqs-section')
                            @include('admin_panel.appearance.home-page.includes.modal-section')
                            @include('admin_panel.appearance.home-page.includes.setting-section')
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </home-page>
@endsection

