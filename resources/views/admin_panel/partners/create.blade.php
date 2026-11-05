@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <partner-form :article="{{ isset($article) ? $article : 'null'}}" inline-template>
        <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
            <div class="d-flex flex-column gap-7 gap-lg-10">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <h2>{{ $pageTitle }}</h2>
                        </div>
                    </div>
                    <div class="card-body">
                        {!! html_entity_decode(build_fields('full_name',trans_admin('full_name'))) !!}
                        {!! html_entity_decode(build_fields('job_title',trans_admin('job_title'))) !!}
                        {!! html_entity_decode(build_fields('description',trans_admin('description'),'','textarea')) !!}

                        <div class="card py-4 mb-5">
                            <label class="mb-2">{{trans_admin('image')}}</label>
                            <upload-file :_file.sync="image"
                                         placeholder="{{trans_admin('image')}}"
                                         :dir="'{{\App\Models\Partner::DIR_PARTNERS_UPLOADS}}'"
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
        </div>
    </partner-form>
@endsection
