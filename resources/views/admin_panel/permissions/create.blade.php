@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <permission-form :permission="{{ isset($permission) ? $permission : 'null'}}" inline-template>
        <form class="form d-flex flex-column flex-lg-row">
            <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
                <div class="d-flex flex-column gap-7 gap-lg-10">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">
                                <h2>{{ $pageTitle }}</h2>
                            </div>
                        </div>
                        <div class="card-body">
                            {!! html_entity_decode(build_fields('show_name',trans_admin('show_name'))) !!}

                            <div class="fv-row w-100 flex-md-root">
                                <label class="form-label">
                                    {{ trans_admin('unique_name') }}
                                    <i class="fas fa-exclamation-circle ms-2 fs-7" data-bs-toggle="popover" data-bs-trigger="hover" data-bs-html="true" data-bs-content="{{trans_admin('permission_names_is_unique')}}"></i>
                                </label>
                                <input type="text" v-model="unique_name" class="form-control" />
                                <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.unique_name">@{{ form.validation.unique_name[0] }}</div>
                            </div>

                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-end">
                    @include('admin_panel.includes.buttons.cancel')
                    @include('admin_panel.includes.buttons.save')
                </div>
            </div>
        </form>
    </permission-form>
@endsection
