@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <guide-form :faq="{{ isset($guide) ? $guide : 'null'}}" inline-template>
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
                            {!! html_entity_decode(build_fields('details',trans_admin('details'),'','textarea')) !!}

                            <div class="mb-10 d-flex flex-wrap gap-5">
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

                                <div class="mb-10 fv-row w-100 flex-md-root" v-if="type=={{\App\Models\Guide::TYPE_PAID}}">
                                    <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                        <span class="required">{{trans_admin('price')}}</span>
                                    </label>
                                    <input type="text" v-model="price" class="form-control " placeholder="{{trans_admin('price')}}"/>
                                    <span v-if="form.validation && form.validation.price" class="error-block">@{{ form.validation.price[0] }}</span>
                                </div>
                            </div>

                            <div class="row">
                                <div class="mb-10 col-md-6">
                                    <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                        <span class="required">{{trans_admin('image')}}</span>
                                    </label>
                                    <upload-file :_file.sync="image"
                                                 placeholder="{{trans_admin('image')}}"
                                                 :dir="'{{\App\Models\Guide::DIR_GUIDE_UPLOADS}}'"
                                                 id='image'
                                                 :type-extension="['jpg', 'jpeg', 'png']"
                                                 div-id='div-image'>
                                    </upload-file>
                                    <span v-if="form.validation&&form.validation['image']" class="error-block">@{{ form.validation['image'][0] }}</span>
                                </div>

                                <div class="mb-10 col-md-6">
                                    <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                        <span class="required">{{trans_admin('file')}}</span>
                                    </label>
                                    <upload-file :_file.sync="file"
                                                 placeholder="{{trans_admin('file')}}"
                                                 :dir="'{{\App\Models\Guide::DIR_GUIDE_UPLOADS}}'"
                                                 id='file'
                                                 :file_type="'documents'"
                                                 :type-extension="['pdf']"
                                                 div-id='div-file'>
                                    </upload-file>
                                    <span v-if="form.validation&&form.validation['file']" class="error-block">@{{ form.validation['file'][0] }}</span>
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
    </guide-form>
@endsection
