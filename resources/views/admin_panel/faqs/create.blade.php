@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <faq-form :faq="{{ isset($faq) ? $faq : 'null'}}" inline-template>
        <form class="form d-flex flex-column flex-lg-row">
            <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
                <div class="d-flex flex-column gap-7 gap-lg-10">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title"><h2>{{ $pageTitle }}</h2></div>
                        </div>
                        <div class="card-body">
                            {!! html_entity_decode(build_fields('title',trans_admin('title'))) !!}
                            {!! html_entity_decode(build_fields('details',trans_admin('details'),'','textarea')) !!}
                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-end">
                    @include('admin_panel.includes.buttons.cancel')
                    @include('admin_panel.includes.buttons.save')
                </div>
            </div>
        </form>
    </faq-form>
@endsection
