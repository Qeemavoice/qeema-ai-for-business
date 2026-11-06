@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <rating-group-form inline-template :group="{{ isset($group) ? json_encode($group) : 'null' }}">
        <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
            <div class="d-flex flex-column gap-7 gap-lg-10">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <h2>{{ $pageTitle }}</h2>
                        </div>
                    </div>
                    <div class="card-body">
                        {!! html_entity_decode(build_fields('name',trans_admin('name'))) !!}

                        <div class="fv-row w-100 flex-md-root">
                            <label class="form-check form-switch form-check-custom form-check-solid">
                                <input class="form-check-input" type="checkbox" v-model="is_active" >
                                <span class="form-check-label fw-bold text-muted">{{ trans_admin('activation') }}</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-end">
                @include('admin_panel.includes.buttons.cancel')
                @include('admin_panel.includes.buttons.save')
            </div>
        </div>
    </rating-group-form>
@endsection
