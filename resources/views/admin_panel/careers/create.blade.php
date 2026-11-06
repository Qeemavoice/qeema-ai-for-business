@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <career-form :job="{{ isset($job) ? $job : 'null'}}" inline-template>
        <form class="form d-flex flex-column flex-lg-row">
            <div class="d-flex flex-column gap-7 gap-lg-10 w-100 w-lg-300px mb-7 me-lg-10">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <h2>{{trans_admin('external_image')}}</h2>
                        </div>
                    </div>
                    <div class="card-body text-center">
                        <div class="mb-3">
                            <upload-file :_file.sync="external_image"
                                         placeholder="{{trans_admin('external_image')}}"
                                         :dir="'{{\App\Models\Career::DIR_JOBS_UPLOADS}}'"
                                         id='external_image'
                                         :type-extension="['jpg', 'jpeg', 'png' ,'svg']"
                                         div-id='div-external-image'>
                            </upload-file>

                            <span v-if="form.validation && form.validation['external_image']" class="error-block">@{{ form.validation['external_image'][0] }}</span>
                        </div>
                        <div class="text-muted fs-7">{{trans_admin('set_the_image')}}</div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <h2>{{trans_admin('interior_image')}}</h2>
                        </div>
                    </div>
                    <div class="card-body text-center">
                        <div class="mb-3">
                            <upload-file :_file.sync="interior_image"
                                         placeholder="{{trans_admin('interior_image')}}"
                                         :dir="'{{\App\Models\Career::DIR_JOBS_UPLOADS}}'"
                                         id='interior_image'
                                         :type-extension="['jpg', 'jpeg', 'png' ,'svg']"
                                         div-id='div-interior-image'>
                            </upload-file>
                            <span v-if="form.validation && form.validation['interior_image']" class="error-block">@{{ form.validation['interior_image'][0] }}</span>
                        </div>
                        <div class="text-muted fs-7">{{trans_admin('set_the_image')}}</div>
                    </div>
                </div>
            </div>
            <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
                <div class="tab-content">
                    <div class="d-flex flex-column gap-7 gap-lg-10">
                        <div class="card py-4">
                            <div class="card-header">
                                <div class="card-title">
                                    <h2>{{trans_admin('general')}}</h2>
                                </div>
                            </div>
                            <div class="card-body">
                                {!! html_entity_decode(build_fields('title',trans_admin('title'))) !!}
                                {!! html_entity_decode(build_fields('job_title',trans_admin('job_title'))) !!}
                            </div>
                        </div>

                        <div class="card py-4">
                            <div class="card-header">
                                <div class="card-title">
                                    <h2>{{trans_admin('working_information')}}</h2>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-lg-6 mb-8">
                                        <div class="form-group">
                                            <label for="min_salary" class="mb-2">{{trans_admin('min_salary')}}</label>
                                            <input type="text" id="min_salary" v-model="min_salary" value="" class="form-control">
                                            <span v-if="form.validation && form.validation.min_salary" class="error-block">@{{ form.validation.min_salary[0] }}</span>
                                        </div>
                                    </div>
                                    <div class="col-lg-6 mb-8">
                                        <div class="form-group">
                                            <label for="max_salary" class="mb-2">{{trans_admin('max_salary')}}</label>
                                            <input type="text" id="max_salary" v-model="max_salary" value="" class="form-control">
                                            <span v-if="form.validation && form.validation.max_salary" class="error-block">@{{ form.validation.max_salary[0] }}</span>
                                        </div>
                                    </div>

                                    <div class="col-lg-6 mb-8">
                                        <label for="workplace_type" class="mb-2">{{trans_admin('workplace_type')}}</label>
                                        <select v-model="workplace_type" class="form-select mb-2"  id="workplace_type">
                                            <option value="">{{trans_admin('select_an_option')}}</option>
                                            @foreach(\App\Models\Career::getWorkplaceTypes() as $key => $value)
                                            <option value="{{$key}}">{{$value}}</option>
                                            @endforeach

                                        </select>
                                    </div>
                                    <div class="col-lg-6 mb-8">
                                        <label for="job_type" class="mb-2">{{trans_admin('job_type')}}</label>
                                        <select v-model="job_type" class="form-select mb-2" id="job_type">
                                            <option value="">{{trans_admin('select_an_option')}}</option>
                                            @foreach(\App\Models\Career::getJobTypes() as $key => $value)
                                                <option value="{{$key}}">{{$value}}</option>
                                            @endforeach
                                        </select>
                                    </div>
                                </div>

                            </div>
                        </div>


                        <div class="card py-4">
                            <!--begin::Card header-->
                            <div class="card-header">
                                <div class="card-title">
                                    <h2>{{trans_admin('content')}}</h2>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="fv-row">
                                    {!! html_entity_decode(build_fields('experience',trans_admin('experience'),'','textarea')) !!}
                                    {!! html_entity_decode(build_fields('responsibilities',trans_admin('responsibilities'),'','textarea')) !!}
                                    {!! html_entity_decode(build_fields('tasks',trans_admin('tasks'),'','textarea')) !!}
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
    </career-form>
@endsection
