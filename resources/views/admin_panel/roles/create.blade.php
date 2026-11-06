@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <role-form :role="{{ isset($role) ? $role : 'null'}}" inline-template>
        <form class="form d-flex flex-column flex-lg-row">
            <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
                <div class="d-flex flex-column gap-7 gap-lg-10">
                    <div class="card">
                        <div class="card-header"><div class="card-title"><h2>{{ $pageTitle }}</h2></div></div>
                        <div class="card-body">
                            {!! html_entity_decode(build_fields('name',trans_admin('name'))) !!}
                        </div>
                    </div>
                </div>
                <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-5 g-xl-9">
                    <div v-for="(permissionsGroup,index) in allPermissions" class="col-md-4">
                        <div class="card h-md-100">
                            <div class="card-header"><div class="card-title"><h2>@{{index}}</h2></div></div>
                            <div class="card-body pt-1">
                                <div class="d-flex flex-column text-gray-600">
                                    <div v-for="permission in permissionsGroup" class="d-flex align-items-center py-2">
                                        <label class="form-check form-check-custom form-check-solid align-items-start">
                                            <input type="checkbox" v-model="checkedPermissions" :value="permission.id" class="form-check-input me-3">
                                            <span class="ml-1">@{{ permission.show_name }}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div v-if="!id" class="card-footer flex-wrap pt-0">
                                <a href="" class="btn btn-light btn-active-primary my-1 me-2">{{trans_admin('view_role')}}</a>
                                <button type="button" class="btn btn-light btn-active-light-primary my-1" data-bs-toggle="modal" data-bs-target="#kt_modal_update_role">{{trans_admin('edit_role')}}</button>
                            </div>
                        </div>
                    </div>
                    <div class="fv-plugins-message-container invalid-feedback"  v-if="form.validation&&form.validation.permissions">@{{ form.validation.permissions[0] }}</div>
                </div>
                <div class="d-flex justify-content-end">
                    @include('admin_panel.includes.buttons.cancel')
                    @include('admin_panel.includes.buttons.save')
                </div>
            </div>
        </form>
    </role-form>
@endsection
