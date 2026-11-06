@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <voice-actor-form :voice-actor="{{ isset($voiceActor) ? json_encode($voiceActor) : 'null'}}" inline-template>
        <form class="form d-flex flex-column flex-lg-row" data-kt-redirect="">
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

                            <div class="mb-10 d-flex flex-wrap gap-5">
                                <div class="fv-row w-100 flex-md-root">
                                    <label class="form-label">{{ trans_admin('email') }}</label>
                                    <input type="email" v-model="email" class="form-control mb-2" />
                                    <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.email">@{{ form.validation.email[0] }}</div>
                                </div>
                                <div class="fv-row w-100 flex-md-root">
                                    <label class="form-label">{{ trans_admin('mobile') }}</label>
                                    <input type="text" v-model="mobile" class="form-control mb-2" />
                                    <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.mobile">@{{ form.validation.mobile[0] }}</div>
                                </div>
                            </div>
                            <div class="mb-10 d-flex flex-wrap gap-5">
                                <div class="fv-row w-100 flex-md-root">
                                    <label for="country" class="form-label mb-2">{{trans_admin('countries')}}</label>
                                    <select v-model="country" class="form-select mb-2"  id="country">
                                        <option value="">{{trans_admin('select_an_option')}}</option>
                                        @foreach($countries as $key => $value)
                                            <option value="{{$value->id}}">{{$value->name}}</option>
                                        @endforeach
                                    </select>
                                    <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.country">@{{ form.validation.country[0] }}</div>
                                </div>
                                <div class="fv-row w-100 flex-md-root">
                                    <label for="languages" class="form-label mb-2">{{trans_admin('languages')}}</label>
                                    <br>
                                    <el-select v-model="languages" multiple placeholder="Select" style="width: 100%;">
                                        <el-option
                                            v-for="item in {{$languages}}"
                                            :key="item.id"
                                            :label="item.name[`{{get_locale()}}`]"
                                            :value="item.id">
                                        </el-option>
                                    </el-select>
                                    <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.languageIds">@{{ form.validation.languageIds[0] }}</div>
                                </div>
                            </div>

                            <div class="mb-10 d-flex flex-wrap gap-5">
                                <div class="fv-row w-100 flex-md-root">
                                    <label for="payment_method" class="form-label mb-2">{{trans_admin('payment_methods')}}</label>
                                    <select v-model="payment_method" class="form-select mb-2"  id="payment_method">
                                        <option value="">{{trans_admin('select_an_option')}}</option>
                                        @foreach($paymentMethods as $key => $method)
                                            <option value="{{$method->id}}">{{$method->name}}</option>
                                        @endforeach
                                    </select>
                                    <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.payment_method">@{{ form.validation.payment_method[0] }}</div>
                                </div>
                                <div class="fv-row w-100 flex-md-root">
                                    <label class="form-label">{{ trans_admin('price_per_minute') }}</label>
                                    <input type="number" v-model="price_per_minute" @focus="clearInputPricePerMinuteDefault" class="form-control mb-2" />
                                    <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.price_per_minute">@{{ form.validation.price_per_minute[0] }}</div>
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

    </voice-actor-form>
@endsection
