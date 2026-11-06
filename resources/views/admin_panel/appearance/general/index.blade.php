@extends('admin_panel.layouts.app')

@push('page-title')
    {{ meta('breadcrumbs-title') }}
@endpush

@section('content')
    <general-index :settings="{{isset($settings) ? $settings->toJson() : ''}}" inline-template>
        <div>
            @include('admin_panel.appearance.general.includes.tabs')

            <div class="row g-xxl-12">
                <div class="col-xxl-12">
                    <div class="card card-xxl-stretch mb-5 mb-xl-10">
                        <div class="tab-content">
                            @include('admin_panel.appearance.general.includes.general')
                            @include('admin_panel.appearance.general.includes.logo')
                            @include('admin_panel.appearance.general.includes.social-media-links')
                            @include('admin_panel.appearance.general.includes.contact-us')
                            @include('admin_panel.appearance.general.includes.footer')
                            @include('admin_panel.appearance.general.includes.meta-options')



                        </div>
                    </div>
                </div>
            </div>
        </div>
@endsection

