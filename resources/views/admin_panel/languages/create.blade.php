@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <language-form :language="{{ isset($language) ? $language : 'null'}}" inline-template>
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
                            {!! html_entity_decode(build_fields('name',trans_admin('name'))) !!}
                            <div class="fv-row w-100 flex-md-root">
                                <label class="form-label">{{ trans_admin('code') }}</label>
                                <input type="text" v-model="code" class="form-control mb-2" />
                                <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.code">@{{ form.validation.code[0] }}</div>
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
    </language-form>
@endsection
