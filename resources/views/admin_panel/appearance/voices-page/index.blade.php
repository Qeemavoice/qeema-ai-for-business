@extends('admin_panel.layouts.app')

@push('page-title')
    {{ meta('breadcrumbs-title') }}
@endpush

@section('content')
    <voices-page :settings="{{isset($settings) ? $settings->toJson() : ''}}" inline-template>
        <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
            <div class="d-flex flex-column gap-7 gap-lg-10">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <h2>{{ $pageTitle }}</h2>
                        </div>
                    </div>
                    <div class="card-body">

                        <div class="mb-10 col-md-12">
                            <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                <span class="required">{{trans_admin('background')}}</span>
                            </label>
                            <upload-file :_file.sync="value.background"
                                         placeholder="{{trans_admin('background')}}"
                                         :dir="'{{\App\Models\Setting::DIR_VOICES_PAGE_UPLOADS}}'"
                                         id='favicon'
                                         :type-extension="['jpg', 'jpeg', 'png' ,'svg']"
                                         div-id='div-background'>
                            </upload-file>
                            <span v-if="form.validation && form.validation['value.background']" class="error-block">@{{ form.validation['value.background'][0] }}</span>
                        </div>

                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-end">
                @include('admin_panel.includes.buttons.cancel')
                @include('admin_panel.includes.buttons.save')
            </div>
        </div>


    </voices-page>
@endsection

