@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <work-form :work="{{ isset($work) ? $work : 'null'}}" inline-template>
        <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
            <div class="d-flex flex-column gap-7 gap-lg-10">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <h2>{{ $pageTitle }}</h2>
                        </div>
                    </div>
                    <div class="card-body">
                        {!! html_entity_decode(build_fields('title',trans_admin('full_name'))) !!}

                        <div class="mb-10 col-md-12">
                            <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                <span>{{trans_admin('url')}}</span>
                            </label>
                            <input type="url" v-model="url" class="form-control" placeholder="{{trans_admin('url')}}"/>
                            <span v-if="form.validation && form.validation['url']" class="error-block">@{{ form.validation['url'][0] }}</span>
                        </div>

                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-end">
                @include('admin_panel.includes.buttons.cancel')
                @include('admin_panel.includes.buttons.save')
            </div>
    </work-form>
@endsection
