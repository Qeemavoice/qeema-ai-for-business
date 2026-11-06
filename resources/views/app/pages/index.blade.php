@extends('app.layouts.app')

@push('page-title',meta('page-title'))
@push('css')
    <style>
        .blog-deatails *{
            font-family: 'Tajawal', sans-serif;
        }
        @media (max-width: 767px){
            .blog-deatails table tr td{
                display:block;
                width:100% !important;
            }
        }
        .blog-deatails h1 strong span,.blog-deatails a strong span{
            font-size: 20px !important;
        }
    </style>
@endpush

@section('content')
    <div class="container blog-page">
        @include('app.layouts.includes.nav')
        <div class="container">

            @include('app.layouts.includes.breadcrumbs')
            @if(isset($banner)&&$banner)
                @include('app.layouts.includes.banner')
            @endif
            <div class="main-blog"  style="padding-top: 0">
                <div class="row">
                    <div class="col-md-12">
                        <div class="blog-deatails">{!! $page->content !!}</div>
                    </div>
                    @if($page->slug === \App\Models\Page::TRAINING && $form)
                        <div class="col-md-12">
                            <h3>{{$form->title}}</h3>
                        </div>
                        <div class="col-md-6" style="justify-content: center;">
                            <form-page :p-form-fields="{{isset($form->fields) ? json_encode($form->fields) : 'null'}}"
                                       :form-id="`{{$form->id}}`"
                                       inline-template>
                                <form class="form-join" style=" background-color: #eaeaea; border: 1px solid #dadce0; border-radius: 8px; margin-bottom: 12px; padding: 24px; page-break-inside: avoid; word-wrap: break-word;">


                                        <div v-for="(field,index) in formFields" class="form-group row mb-4">
                                            <div class="col-md-12 mb-3" >
                                                <label style="font-weight: bold;">@{{field.label}}</label>
                                                <template v-if="field.type === {{\App\Models\InputField::TEXT}}">
                                                    <input class="form-control" v-model="formData[field.name]['name']" type="text">
                                                </template>
                                                <template v-if="field.type === {{\App\Models\InputField::TEXT_AREA}}">
                                                    <textarea class="form-control" v-model="formData[field.name]['name']"></textarea>
                                                </template>
                                                <template v-if="field.type === {{\App\Models\InputField::FILE}}">
                                                    <upload-file :_file.sync="formData[field.name]['name']"
                                                                 :id="field.name"
                                                                 :hide-placeholder="true"
                                                                 :div-id="'div'+field.name">
                                                    </upload-file>
                                                </template>
                                                <template v-if="field.type === {{\App\Models\InputField::CHECKBOX}}">
                                                    <br>
                                                    <template v-for="(option,subIndex) in field.options">
                                                        <input type="checkbox" v-model="formData[field.name]['name']" :value="option.value" :id="field.name+'_s'+subIndex">
                                                        <label :for="field.name+'_s'+subIndex"> @{{option.value}}</label><br>
                                                    </template>
                                                </template>
                                                <template v-if="field.type === {{\App\Models\InputField::RADIO}}">
                                                    <br>
                                                    <template v-for="(option,subIndex) in field.options">
                                                        <input type="radio" v-model="formData[field.name]['name']" :value="option.value" :name="field.name" :id="field.name+'_s'+subIndex">
                                                        <label :for="field.name+'_s'+subIndex"> @{{option.value}}</label><br>
                                                    </template>
                                                </template>


                                                <template v-if="field.type === {{\App\Models\InputField::DROP_DOWN_LIST}}">
                                                    <select v-model="formData[field.name]['name']" class="form-control">
                                                        <option value="">اختر</option>
                                                        <option v-for="(option,subIndex) in field.options" :value="option.value">@{{option.value}}</option>
                                                    </select>
                                                </template>
                                            </div>
                                        </div>

                                    <button type="button" @click="save" :disabled="form.disabledButton" class="btn bg-login text-light px-0 w-100 py-3" style="display: block; background: rgb(254, 161, 7) !important;color: rgb(255, 255, 255) !important; border: none !important;"><span>حفظ</span></button>
                                </form>
                            </form-page>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
@endsection
