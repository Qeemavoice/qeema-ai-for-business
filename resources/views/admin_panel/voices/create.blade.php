@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <voice-form :voice="{{ isset($voice) ? json_encode($voice) : 'null'}}"
                :commissions="{{json_encode($commissions)}}"
                inline-template>
        <form class="form d-flex flex-column flex-lg-row">
            <div class="d-flex flex-column gap-7 gap-lg-10 w-100 w-lg-300px mb-7 me-lg-10">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <h2>{{trans_admin('audio_file')}}</h2>
                        </div>
                    </div>
                    <div class="card-body text-center">
                        <div class="mb-3">
{{--                            <upload-file :_file.sync="audio_file"--}}
{{--                                         placeholder="{{trans_admin('audio_file')}}"--}}
{{--                                         :dir="'{{\App\Models\Voice::DIR_VOICES_UPLOADS}}'"--}}
{{--                                         id='audio_file'--}}
{{--                                         :file_type="'audio'"--}}
{{--                                         div-id='div-audio-file'>--}}
{{--                            </upload-file>--}}
                            <el-file-upload type="audio"
                                            :_file.sync="audio_file"
                                            dir="{{\App\Models\Voice::DIR_VOICES_UPLOADS}}">
                            </el-file-upload>
                            <span v-if="form.validation && form.validation['audio_file']" class="error-block">@{{ form.validation['audio_file'][0] }}</span>
                        </div>
                        <div class="text-muted fs-7">{{trans_admin('audio_file')}}{{trans_admin('set_the_voice')}}</div>
                    </div>
                </div>
            </div>
            <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
                <div class="tab-content">
                    <div class="d-flex flex-column gap-7 gap-lg-10">
                        <div class="card">
                            <div class="card-header">
                                <div class="card-title"><h2>{{trans_admin('general')}}</h2></div>
                            </div>
                            <div class="card-body">
                                {!! html_entity_decode(build_fields('title',trans_admin('title'))) !!}

                                <div class="row">
                                    <div class="col-lg-6 mb-8">
                                        <label for="type" class="form-label mb-2">{{trans_admin('type')}}</label>
                                        <select v-model="type" class="form-select mb-2" id="type">
                                            <option value="">{{trans_admin('select_an_option')}}</option>
                                            @foreach($types as $key => $value)
                                                <option value="{{$value->id}}">{{$value->name}}</option>
                                            @endforeach
                                        </select>
                                        <span v-if="form.validation && form.validation.type" class="error-block">@{{ form.validation.type[0] }}</span>
                                    </div>

                                    <div class="col-lg-6 mb-8">
                                        <label for="voiceover" class="form-label mb-2">{{trans_admin('voice_actor')}}</label>
                                        <el-select v-model="voiceover"
                                                   filterable
                                                   remote
                                                   :loading="form.loadingVoiceActorList"
                                                   :remote-method="searchVoiceOvers"
                                                   class="w-100" no-data-text="{{trans_admin('no_data')}}"
                                                   placeholder="{{trans_admin('select_voice_actor')}}">
                                            <el-option v-for="(voiceover,v) in voiceovers"
                                                       :key="voiceover ? voiceover.id : ''"
                                                       :value="voiceover ? voiceover.id : ''"
                                                       :label="voiceover ? voiceover.full_name[$lang] : ''">
                                            </el-option>
                                        </el-select>
                                        <span v-if="form.validation && form.validation.voiceover" class="error-block">@{{ form.validation.voiceover[0] }}</span>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-lg-12 mb-8">
                                        <label for="categories" class="form-label mb-2">{{trans_admin('categories')}}</label>
                                        <el-select v-model="categories_ids" filterable multiple class="w-100" no-data-text="{{trans_admin('no_data')}}" placeholder="{{trans_admin('select')}}">
                                            <el-option v-for="category in {{\App\Models\Category::categories()}}" :key="voiceover.id"
                                                       :value="category.id" :label="category.name[$lang]">
                                                @{{ category.name[$lang] }}
                                            </el-option>
                                        </el-select>
                                        <span v-if="form.validation && form.validation.categories_ids" class="error-block">@{{ form.validation.categories_ids[0] }}</span>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-lg-6 mb-8">
                                        <label for="dialects" class="form-label mb-2">{{trans_admin('languages')}}</label>
                                        <select v-model="language" class="form-select mb-2"  id="language">
                                            <option value="">{{trans_admin('select_an_option')}}</option>
                                            <option v-for="language in languages" :value="language.id">@{{ language.name }}</option>
                                        </select>
                                        <span v-if="form.validation && form.validation.language" class="error-block">@{{ form.validation.language[0] }}</span>
                                    </div>
                                    <div class="col-lg-6 mb-8">
                                        <label for="dialects" class="form-label mb-2">{{trans_admin('dialects')}}</label>
                                        <select v-model="dialect" class="form-select mb-2"  id="dialect">
                                            <option value="">{{trans_admin('select_an_option')}}</option>
                                            <option v-for="dialect in dialects" :value="dialect.id">@{{ dialect.name[$lang] }}</option>
                                        </select>
                                        <span v-if="form.validation && form.validation.dialect" class="error-block">@{{ form.validation.dialect[0] }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div class="card-title"><h2>{{trans_admin('pricing')}}</h2></div>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-lg-6 mb-8">
                                        <div class="form-group">
                                            <label for="price_per_minute" class="mb-2">{{trans_admin('price_per_minute')}}</label>
                                            <input type="text" v-model="price_per_minute" id="price_per_minute"  value="" class="form-control">
                                            <span v-if="form.validation && form.validation.price_per_minute" class="error-block">@{{ form.validation.price_per_minute[0] }}</span>
                                        </div>
                                    </div>
                                    <div class="col-lg-6 mb-8">
                                        <div class="form-group">
                                            <label for="total_price" class="mb-2">{{trans_admin('total_price')}}</label>
                                            <input type="text" v-model="total_price" id="total_price"  value="" class="form-control" disabled="">
                                            <span v-if="form.validation && form.validation.total_price" class="error-block">@{{ form.validation.total_price[0] }}</span>
                                            <div class="fs-7 fw-bold text-muted">
                                                يتم احتساب السعر الاجمالي من خلال اضافة عمولة المنصة
                                                <code>{{$commissions->platform}}%</code>
{{--                                                بالإضافة إلى احتساب عمولة بوابة الدفع [--}}
{{--                                                @foreach(getPaymentMethods() as $key => $value)--}}
{{--                                                    @if($value->id == \App\Models\PaymentMethod::STRIPE)--}}
{{--                                                    {{$value->name}} : <code>{{$commissions->stripe}}% </code> أو--}}
{{--                                                    @endif--}}
{{--                                                    @if($value->id == \App\Models\PaymentMethod::PAYPAL)--}}
{{--                                                    {{$value->name}} : <code>{{$commissions->paypal}}%</code>--}}
{{--                                                    @endif--}}
{{--                                                @endforeach--}}
{{--                                                ]--}}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <div class="card-title"><h2>{{trans_admin('meta_options')}}</h2></div>
                            </div>
                            <div class="card-body">
                                <div class="fv-row">
                                    {!! html_entity_decode(build_fields('meta_title',trans_admin('meta_title'),null,null,null,"Set a meta tag title. Recommended to be simple and precise keywords")) !!}
                                    {!! html_entity_decode(build_fields('meta_description',trans_admin('description'), null, 'textarea',null,"Set a meta tag description to the category for increased SEO ranking.")) !!}
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
    </voice-form>
@endsection

