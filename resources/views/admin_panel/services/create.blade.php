@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <service-form :service="{{ isset($service) ? $service : 'null'}}" inline-template>
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

                        <div class="mb-10 col-md-12">
                            <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                <span>{{trans_admin('value')}}</span>
                            </label>
                            <input type="value" v-model="value" class="form-control" placeholder="{{trans_admin('value')}}"/>
                            <span v-if="form.validation && form.validation['value']" class="error-block">@{{ form.validation['value'][0] }}</span>
                        </div>
                        <div class="fv-row w-100 flex-md-root">
                            <label class="form-label">{{trans_admin('types')}}</label>
                            <select v-model="type" class="form-control">
                                <option value="" disabled>{{trans_admin('select_option')}}</option>
                                @foreach($types as $key => $value)
                                <option value="{{$key}}">{{ $value}}</option>
                                @endforeach
                            </select>
                            <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.type">@{{ form.validation.type[0] }}</div>
                        </div>

                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-end">
                @include('admin_panel.includes.buttons.cancel')
                @include('admin_panel.includes.buttons.save')
            </div>
        </div>
    </service-form>
@endsection
