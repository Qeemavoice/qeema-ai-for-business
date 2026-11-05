@extends('admin_panel.layouts.app')

@push('page-title')
    {{trans_admin('orders')}}
@endpush

@section('content')
    <form-details-index :form="{{isset($form)?$form->toJson() : 'null'}}" inline-template>
        <div class="d-flex flex-column gap-7 gap-lg-10">
            <div class="d-flex flex-wrap flex-stack gap-5 gap-lg-10">
                @include('admin_panel.forms.details.includes.tabs')
            </div>
            <div class="tab-content">
                @include('admin_panel.forms.details.includes.form-tab')
                @include('admin_panel.forms.details.includes.form-answers-tab')
            </div>
        </div>
    </form-details-index>
@endsection
