@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <banner-form :banner="{{ isset($banner) ? $banner : 'null'}}" inline-template>
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
                            {!! html_entity_decode(build_fields('title',trans_admin('title'))) !!}
                            {!! html_entity_decode(build_fields('description',trans_admin('description'),'','textarea')) !!}

                            <div class="row">
                                <div class="mb-10 col-md-6">
                                    <label for="country" class="form-label mb-2">{{trans_admin('positions')}}</label>
                                    <select v-model="position" class="form-select mb-2"  id="position">
                                        <option value="">{{trans_admin('select')}}</option>
                                        @foreach($positions as $key => $value)
                                            <option value="{{$key}}">{{$value}}</option>
                                        @endforeach
                                    </select>
                                    <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.country">@{{ form.validation.country[0] }}</div>
                                </div>
                                <div class="mb-10 col-md-6">
                                    <label for="country" class="form-label mb-2">{{trans_admin('pages')}}</label>
                                    <select v-model="page" class="form-select mb-2"  id="page">
                                        <option value="">{{trans_admin('select')}}</option>
                                        @foreach($pages as $key => $value)
                                            <option value="{{$key}}">{{$value}}</option>
                                        @endforeach
                                    </select>
                                    <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.country">@{{ form.validation.country[0] }}</div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="mb-10 col-md-6">
                                    <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                        <span class="required">{{trans_admin('image')}}</span>
                                    </label>
                                    <upload-file :_file.sync="image"
                                                 placeholder="{{trans_admin('image')}}"
                                                 :dir="'{{\App\Models\Banner::DIR_BANNER_UPLOADS}}'"
                                                 id='image'
                                                 :type-extension="['jpg', 'jpeg', 'png' ,'svg']"
                                                 div-id='div-image'>
                                    </upload-file>
                                    <span v-if="form.validation&&form.validation['value.image']" class="error-block">@{{ form.validation['value.image'][0] }}</span>
                                    <div class="text-muted fs-7">صورة الإعلان 1728*200</div>
                                </div>
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
    </banner-form>
@endsection
