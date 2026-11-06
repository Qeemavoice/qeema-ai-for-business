
@extends('admin_panel.layouts.app')

@push('page-title')
    {{ meta('breadcrumbs-title') }}
@endpush

@section('content')
    <setting-currencies-form :page="'{{$page}}'" :settings="{{ isset($settings) ? json_encode($settings) : 'null' }}" inline-template>
        <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
            <div class="d-flex flex-column gap-7 gap-lg-10">
                <div class="card">
                    <div class="card-header cursor-pointer">
                        <div class="card-title">
                            <h2>{{ meta('breadcrumbs-title') }}</h2>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="fv-row w-100 flex-md-root">
                            <div class="row">
                                <div class="mb-10 col-md-12">
                                    <label for="default_currency" class="form-label mb-2">{{trans_admin('default_currency')}}</label>
                                    <select v-model="default_currency" class="form-select mb-2" id="default_currency">
                                        <option value="">{{trans_admin('please_select')}}</option>
                                        <option v-for="currency in currencies" :value="currency.id">@{{ currency.name }}</option>
                                    </select>
                                    <span class="form-control-feedback error-block" v-if="form.validation && form.validation.default_currency">@{{ form.validation.default_currency[0] }}</span>
                                </div>
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

    </setting-currencies-form>
@endsection



