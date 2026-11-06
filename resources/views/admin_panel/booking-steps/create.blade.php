@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <booking-step-form :step="{{ isset($step) ? $step : 'null'}}" inline-template>
        <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
            <div class="d-flex flex-column gap-7 gap-lg-10">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <h2>{{ $pageTitle }}</h2>
                        </div>
                    </div>
                    <div class="card-body">
                        {!! html_entity_decode(build_fields('title',trans_admin('title'))) !!}

                        <div class="card py-4 mb-5">
                            <label class="mb-2">{{trans_admin('image')}}</label>
                            <upload-file :_file.sync="image"
                                         placeholder="{{trans_admin('image')}}"
                                         :dir="'{{\App\Models\BookingStep::DIR_BOOKING_STEPS_UPLOADS}}'"
                                         id='favicon'
                                         :type-extension="['jpg', 'jpeg', 'png' ,'svg']"
                                         div-id='div-image'>
                            </upload-file>
                            <span v-if="form.validation && form.validation['image']" class="error-block">@{{ form.validation['value.image'][0] }}</span>
                        </div>

                        {!! html_entity_decode(build_fields('alt',trans_admin('alt'),'','textarea')) !!}
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-end">
                @include('admin_panel.includes.buttons.cancel')
                @include('admin_panel.includes.buttons.save')
            </div>
    </booking-step-form>
@endsection
