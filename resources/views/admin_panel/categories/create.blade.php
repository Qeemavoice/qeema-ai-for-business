@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <category-form :category="{{ isset($category) ? $category : 'null'}}" inline-template>
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

                            <div class="mb-10 fv-row w-100 flex-md-root">
                                <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                    <span class="required">{{trans_admin('icon')}} <a href="https://fontawesome.com/v5/search" target="_blank" class="text-primary">{{trans_admin('fontawesome')}}</a></span>
                                </label>
                                <input type="text" v-model="fontawesome_icon" class="form-control " placeholder="{{trans_admin('fontawesome_icon')}}"/>
                                <span v-if="form.validation && form.validation.fontawesome_icon" class="error-block">@{{ form.validation.fontawesome_icon[0] }}</span>
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
    </category-form>
@endsection
