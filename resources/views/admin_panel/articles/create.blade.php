@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <article-form :article="{{ isset($article) ? $article : 'null'}}" inline-template>
        <form class="form d-flex flex-column flex-lg-row">
            <div class="d-flex flex-column gap-7 gap-lg-10 w-100 w-lg-300px mb-7 me-lg-10">
                <div class="card py-4">
                    <div class="card-header">
                        <div class="card-title">
                            <h2>{{trans_admin('external_image')}}</h2>
                        </div>
                    </div>
                    <div class="card-body text-center">
                        <div class="mb-3">
                            <upload-file :_file.sync="external_image"
                                         :dir="'{{\App\Models\Article::DIR_ARTICLES_UPLOADS}}'"
                                         placeholder="{{trans_admin('external_image')}}"
                                         :type-extension="['jpg', 'jpeg', 'png' ,'svg']"
                                         id='external_image'
                                         div-id='div-external-image'>
                            </upload-file>
                            <span v-if="form.validation && form.validation['external_image']" class="error-block">@{{ form.validation['external_image'][0] }}</span>
                        </div>
                        <div class="text-muted fs-7">{{trans_admin('set_the_image')}}</div>
                    </div>
                </div>
                <div class="card py-4">
                    <div class="card-header">
                        <div class="card-title">
                            <h2>{{trans_admin('internal_image')}}</h2>
                        </div>
                    </div>
                    <div class="card-body text-center">
                        <div class="mb-3">
                            <upload-file :_file.sync="internal_image"
                                         placeholder="{{trans_admin('internal_image')}}"
                                         :dir="'{{\App\Models\Article::DIR_ARTICLES_UPLOADS}}'"
                                         id='internal_image'
                                         :type-extension="['jpg', 'jpeg', 'png' ,'svg']"
                                         div-id='div-internal_image'>
                            </upload-file>
                            <span v-if="form.validation && form.validation['internal_image']" class="error-block">@{{ form.validation['internal_image'][0] }}</span>
                        </div>
                        <div class="text-muted fs-7">{{trans_admin('set_the_image')}}</div>
                    </div>
                </div>

                <div class="card py-4">
                    <div class="card-header">
                        <div class="card-title">
                            <h2>{{trans_admin('status')}}</h2>
                        </div>
                        <div class="card-toolbar">
                            <div class="rounded-circle bg-success w-15px h-15px" id="kt_ecommerce_add_product_status"></div>
                        </div>
                    </div>
                    <div class="card-body">
                        <select class="form-select mb-2" v-model="status">
                            <option value="" disabled>{{trans_admin('select')}}...</option>
                            @foreach($statuses as $key => $status)
                                @if($status->id === \App\Models\ArticleStatus::SCHEDULED)
                                    @continue
                                @endif
                                <option value="{{$status->id}}">{{$status->name}}</option>
                            @endforeach
                        </select>
                        <div class="text-muted fs-7">{{trans_admin('set_the_article_status')}}.</div>
                    </div>
                </div>

                <div class="card py-4">
                    <div class="card-header">
                        <div class="card-title">
                            <h2>{{trans_admin('video_url')}}</h2>
                        </div>

                    </div>
                    <div class="card-body">
                        <textarea v-model="video_url" class="form-control me-3 flex-grow-1"></textarea>
                        <span v-if="form.validation && form.validation['video_url']" class="error-block">@{{ form.validation['video_url'][0] }}</span>
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

                                {!! html_entity_decode(build_fields('short_description',trans_admin('short_description'),'','textarea')) !!}

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
                                    <div class="col-md-12 mb-8" v-for="(lang, key) in LANGUAGES">
                                        <label for="" class="fs-5 fw-bolder form-label mb-2">{{trans_admin('content')}} (@{{ key }})<span class="text-danger"> *</span></label>
                                        <ckeditor v-model="content[key]" :config="{extraPlugins: ['colorbutton','justify'], language: `${key}`, filebrowserUploadUrl: `/uploads/ckeditor-upload-img?_token=${$token}`}" name="about"></ckeditor>
                                        <span v-if="form.validation && form.validation[`a_content.${key}`]" class="error-block">@{{ form.validation[`a_content.${key}`][0] }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card py-4">
                            <div class="card-header">
                                <div class="card-title">
                                    <h2>{{trans_admin('meta_options')}}</h2>
                                </div>
                            </div>
                            <div class="card-body">
                                {!! html_entity_decode(build_fields('meta_keywords',trans_admin('meta_keyword'), null, 'textarea',null,"Set a list of keywords that the category is related to. Separate the keywords by adding a comma ,between each keyword.")) !!}

                                {!! html_entity_decode(build_fields('meta_description',trans_admin('description'), null, 'textarea',null,"Set a meta tag description to the category for increased SEO ranking.")) !!}
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
    </article-form>
@endsection
