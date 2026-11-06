@extends('admin_panel.layouts.app')

@push('page-title')
    {{ meta('breadcrumbs-title') }}
@endpush

@section('content')
    <setting-maintenance-index :page="'{{$page}}'" :settings="{{ isset($settings) ? json_encode($settings) : 'null' }}" inline-template>
        <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
            <div class="d-flex flex-column gap-7 gap-lg-10">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <h2>{{ meta('breadcrumbs-title') }}</h2>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="fv-row w-100 flex-md-root">
                            <label class="form-check form-switch form-check-custom form-check-solid">
                                <input class="form-check-input" type="checkbox" v-model="maintenance_mode" >
                                <span class="form-check-label fw-bold text-muted">{{ trans_admin('put_app_into_maintenance_mode') }}</span>
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
    </setting-maintenance-index>
@endsection


