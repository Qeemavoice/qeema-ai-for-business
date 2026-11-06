@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <rating-criteria-form :criteria="{{ isset($criteria) ? json_encode($criteria) : 'null' }}" inline-template>
        <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
            <div class="d-flex flex-column gap-7 gap-lg-10">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <h2>{{ $pageTitle }}</h2>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="col-lg-12 mb-8">
                            <label for="categories" class="form-label mb-2">{{trans_admin('group')}}</label>
                            <div>
                                <el-select v-model="group_id"
                                           :loading="form.loadingGroupList"
                                           :remote-method="getGroup"
                                           class="w-100"
                                           filterable
                                           remote
                                           reserve-keyword
                                           no-data-text="{{trans_admin('no_data')}}"
                                           placeholder="{{trans_admin('select')}}">
                                    <el-option v-for="group in groups"
                                               :key="group.id"
                                               :value="group.id"
                                               :label="group.name[$lang]">
                                        @{{ group.name[$lang] }}
                                    </el-option>
                                </el-select>
                            </div>
                            <span v-if="form.validation && form.validation.group" class="error-block">@{{ form.validation.group[0] }}</span>
                        </div>
                        {!! html_entity_decode(build_fields('name',trans_admin('name'))) !!}
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-end">
                @include('admin_panel.includes.buttons.cancel')
                @include('admin_panel.includes.buttons.save')
            </div>
        </div>
    </rating-criteria-form>
@endsection
