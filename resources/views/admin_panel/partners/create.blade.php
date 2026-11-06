@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <partner-form :partner="{{ isset($partner) ? $partner : 'null'}}" inline-template>
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
                        <div class="mb-5">
                            <label class="form-label" for="partner-reference-url">رابط مرجعي يثبت العلاقة مع الجهة</label>
                            <input id="partner-reference-url" type="url" v-model.trim="reference_url" class="form-control" placeholder="https://example.com/..." dir="ltr">
                            <span v-if="form.validation && form.validation.reference_url" class="error-block">@{{ form.validation.reference_url[0] }}</span>
                        </div>
                        <div class="form-check form-switch mt-4">
                            <input class="form-check-input" type="checkbox" id="show_on_homepage" v-model="show_on_homepage">
                            <label class="form-check-label" for="show_on_homepage">عرض الجهة في الصفحة الرئيسية</label>
                            <div class="form-text">يتطلب تفعيل العرض رابطًا مرجعيًا وتأكيد إذن استخدام الاسم والشعار.</div>
                        </div>
                        <div class="form-check form-switch mt-4">
                            <input class="form-check-input" type="checkbox" id="permission_confirmed" v-model="permission_confirmed">
                            <label class="form-check-label" for="permission_confirmed">تم التأكد من إذن استخدام الاسم والشعار</label>
                            <span v-if="form.validation && form.validation.permission_confirmed" class="error-block d-block">@{{ form.validation.permission_confirmed[0] }}</span>
                        </div>
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
