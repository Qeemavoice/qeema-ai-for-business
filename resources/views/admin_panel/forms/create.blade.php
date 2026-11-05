@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <form-form :p-form="{{ isset($form) ? json_encode($form) : 'null'}}" inline-template>
        <form id="kt_ecommerce_add_product_form" class="form d-flex flex-column flex-lg-row" data-kt-redirect="">
            <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
                <div class="d-flex flex-column gap-7 gap-lg-10">
                    <div class="card">
                        <div class="card-header"><div class="card-title"><h2>{{ $pageTitle }}</h2></div></div>
                        <div class="card-body">
                            <div class="fv-row w-100 flex-md-root mb-8">
                                <label class="form-label">{{trans_admin('page')}}</label>
                                <select v-model="page" class="form-control">
                                    <option value="" disabled>{{trans_admin('select_option')}}</option>
                                    <option v-for="(page,index) in pages" :value="page.id">@{{ page.slug}}</option>
                                </select>
                                <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.page">@{{ form.validation.page[0] }}</div>
                            </div>
                            {!! html_entity_decode(build_fields('title',trans_admin('title'))) !!}

                            <template v-for="(row,index) in formInputFields" v-if="formInputFields.length>0">
                                <div class="notice bg-light-primary rounded border-primary border border-dashed mb-9 p-6">
                                    <div class="row mb-10">
                                        <template v-if="row.input_field_id==={{\App\Models\InputField::TEXT}}">
                                            <div class="col-md-11">
                                                <div class="form-group">
                                                    <label class="form-label">@{{row['label']}}</label>
                                                    <input type="text"  class="form-control">
                                                </div>
                                            </div>
                                            <div class="col-md-1">
                                                <div class="form-group">
                                                    <label class="form-label">حذف</label>
                                                    <button type="button" @click="deleteField(index,row['label'])" :disabled="form.disabledDeleteButton" class="btn btn-danger"><i class="fa fa-trash"></i></button>
                                                </div>
                                            </div>
                                        </template>
                                        <template v-if="row.input_field_id==={{\App\Models\InputField::TEXT_AREA}}">
                                            <div class="col-md-11">
                                                <div class="form-group">
                                                    <label class="form-label">@{{row['label']}}</label>
                                                    <textarea class="form-control"></textarea>
                                                </div>
                                            </div>
                                            <div class="col-md-1">
                                                <div class="form-group">
                                                    <label class="form-label">حذف</label>
                                                    <button type="button" @click="deleteField(index,row['label'])" :disabled="form.disabledDeleteButton" class="btn btn-danger"><i class="fa fa-trash"></i></button>
                                                </div>
                                            </div>
                                        </template>
                                        <template v-if="row.input_field_id==={{\App\Models\InputField::FILE}}">
                                            <div class="col-md-10">
                                                <div class="form-group">
                                                    <label class="form-label">@{{row['label']}}</label>
                                                    <input type="file" class="form-control">
                                                </div>
                                            </div>
                                            <div class="col-md-1">
                                                <div class="form-group">
                                                    <label class="form-label">حذف</label>
                                                    <button type="button" @click="deleteField(index,row['label'])" :disabled="form.disabledDeleteButton" class="btn btn-danger"><i class="fa fa-trash"></i></button>
                                                </div>
                                            </div>
                                        </template>

                                        <template v-if="row.input_field_id==={{\App\Models\InputField::RADIO}} || row.input_field_id==={{\App\Models\InputField::CHECKBOX}} || row.input_field_id==={{\App\Models\InputField::DROP_DOWN_LIST}}">
                                            <div class="col-md-10 mt-8">
                                                <div class="form-group">
                                                    <label class="form-label">@{{row['label']}}</label>
                                                </div>
                                                <div class="row mb-5 mt-5" v-for="(subRow,subIndex) in row['listOfOptions']" v-if="row['listOfOptions'].length>0">
                                                    <div class="col-md-11">
                                                        <div class="form-group">
                                                            <label class="form-label">{{trans_admin('value')}}</label>
                                                            <input type="text" class="form-control" v-model="subRow['value']">
                                                        </div>
                                                    </div>
                                                    <div class="col-md-1">
                                                        <div class="form-group">
                                                            <label class="form-label">حذف</label>
                                                            <button type="button" @click="deleteSubField(index,subIndex,subRow['value'])" :disabled="form.disabledButton" class="btn btn-danger"><i class="fa fa-trash"></i></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-2 d-flex">
                                                <div class="form-group">
                                                    <label class="form-label">اضافة</label>
                                                    <button type="button" @click="addSubField(index)" :disabled="form.disabledDeleteButton" class="btn btn-success"><i class="fa fa-plus"></i></button>
                                                </div>
                                                <div class="form-group">
                                                    <label class="form-label">حذف</label>
                                                    <button type="button" @click="deleteField(index,row['label'])" :disabled="form.disabledButton" class="btn btn-danger"><i class="fa fa-trash"></i></button>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </template>

                            <div class="row mb-10">
                                <div class="col-md-5">
                                    <div class="form-group">
                                        <label class="form-label">{{trans_admin('field')}}</label>
                                        <select v-model="input_field" class="form-control">
                                            <option value="">{{trans_admin('select_option')}}</option>
                                            <option v-for="(field,index) in inputFields" :value="field.id">@{{ field.title}}</option>
                                        </select>
                                        <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.field">@{{ form.validation.field[0] }}</div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label">{{trans_admin('label')}}</label>
                                        <input type="text" v-model="label" class="form-control">
                                        <div class="fv-plugins-message-container invalid-feedback" v-if="form.validation&&form.validation.label">@{{ form.validation.label[0] }}</div>
                                    </div>
                                </div>
                                <div class="col-md-1">
                                    <div class="form-group">
                                        <label class="form-label">اضافة</label>
                                        <button type="button" @click="addField" :disabled="label===''" class="btn btn-success"><i class="fa fa-plus"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-end">
                    @include('admin_panel.includes.buttons.cancel')
{{--                    <button @click="viewForm" :disabled="form.disabledButton" data-bs-toggle="modal" data-bs-target="#modal_view_form" type="button" class="btn btn-warning me-5">{{ trans_admin('view')}}</button>--}}
                    @include('admin_panel.includes.buttons.save')
                </div>
            </div>

            <div class="modal fade" id="modal_view_form" tabindex="-1" aria-modal="true" role="dialog">
                <div class="modal-dialog modal-dialog-centered mw-650px">
                    <div class="modal-content rounded">
                        <div class="modal-header pb-0 border-0 justify-content-end">
                            <div class="btn btn-sm btn-icon btn-active-color-primary" data-bs-dismiss="modal">
                                <span class="svg-icon svg-icon-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <rect opacity="0.5" x="6" y="17.3137" width="16" height="2" rx="1" transform="rotate(-45 6 17.3137)" fill="black"></rect>
                                        <rect x="7.41422" y="6" width="16" height="2" rx="1" transform="rotate(45 7.41422 6)" fill="black"></rect>
                                    </svg>
							    </span>
                            </div>
                        </div>
                        <div class="modal-body scroll-y px-10 px-lg-15 pt-0 pb-15">
                            <form class="form fv-plugins-bootstrap5 fv-plugins-framework" >

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </form-form>
@endsection


