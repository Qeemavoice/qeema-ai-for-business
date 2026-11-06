@extends('admin_panel.layouts.app')

@push('page-title')
    {{trans_admin('pages')}}
@endpush
@push('css')
    <style>
        .cke_notifications_area {
            display: none;
        }
    </style>
@endpush
@section('content')

    <pages-show :page="{{isset($page)? json_encode($page) :''}}" inline-template>
        <div class="card">
            <div class="card-header border-0 pt-6" data-select2-id="select2-data-80-1718">
                <h3>@{{ title[$lang] }}</h3>
            </div>


            <div class="card-body pt-0">
                <form @submit.prevent="save">
                    <div class="row">
                        {!! html_entity_decode(build_fields('title',trans_admin('title'))) !!}

                        <div class="col-md-12" v-for="(lang, key) in LANGUAGES">
                            <label for="" class="fs-5 fw-bolder form-label mb-2">{{trans_admin('description')}} (@{{ key }})<span class="text-danger"> *</span></label>
                            <ckeditor v-model="description[key]" :config="{extraPlugins: ['colorbutton','justify'], language: `${key}`, filebrowserUploadUrl: `/uploads/ckeditor-upload-img?_token=${$token}`}" name="about"></ckeditor>
                            <span v-if="form.validation && form.validation[`description.${key}`]" class="error-block">@{{ form.validation[`description.${key}`][0] }}</span>
                        </div>

                        <div class="modal-footer">
                            <button type="submit" class="btn btn-primary" :disabled="form.disabledButton">{{trans_admin('save')}}</button>
                        </div>
                    </div>
                </form>
            </div>

        </div>
    </pages-show>
@endsection
