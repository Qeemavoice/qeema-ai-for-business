@extends('app.layouts.app')

@push('page-title',meta('page-title'))


@section('content')
    <div class="container blog-page">
    @include('app.layouts.includes.nav')
    @include('app.layouts.includes.breadcrumbs')
        <div class="row">
            <div class="col-md-5 mb-4">
                <div class="book-image">
                    <img data-name="product_image" id="main_image" class="border-radius-5" src="{{$career->interior_image_url}}" style="width: 100%; border-radius:5px;object-fit:cover" alt="مطلوب مبرمج ويب">
                </div>
                <div class="row mt-3">
                    <div class="col-md-12 text-center">
                        <ul id="divButtons" class="">
                            <li><span style="font-weight:bold ">شارك عبر :</span></li>
                            <li><a href="https://www.facebook.com/sharer?app_id=&amp;u={{url()->current()}}&amp;redirect_uri={{route_app('home.index')}}&amp;display=popup" class="facebook" onclick="javascript:window.open(this.href,'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=500,width=500');return false;"><i class="fab fa-facebook-f"></i><span> فيس بوك </span></a></li>
                            <li><a href="https://twitter.com/share?url={{url()->current()}}&amp;hashtags=قيمة,qeem" class="twitter" onclick="javascript:window.open(this.href,'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=500,width=500');return false;"><i class="fab fa-twitter"></i><span> تويتر</span></a></li>
                            <li><a href="whatsapp://send?text=:: {{url()->current()}}" class="google" onclick="javascript:window.open(this.href,'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=500,width=500');return false;"><i class="fab fa-whatsapp"></i><span> واتس أب</span></a></li>
                        </ul>
                    </div>
                </div>
                <application-career-form :career="{{isset($career) ? json_encode($career) : 'null' }}" inline-template>
                    <div class="row mt-4" v-loading="form.loadingDisplay">
                        <div class="col-md-12">
                            <h4>التقدم للوظيفة</h4>
                        </div>
                        <div class="col-md-12 mt-3">
                            <label for="name">الاسم</label>
                            <input class="form-control name" placeholder="الاسم" v-model="name" >
                            <span v-if="form.validation && form.validation.name" class="error-block">@{{ form.validation.name[0] }}</span>
                        </div>
                        <div class="col-md-6 mt-3">
                            <label for="email">البريد الالكتروني</label>
                            <input class="form-control email" placeholder="البريد الالكتروني" v-model="email">
                            <span v-if="form.validation && form.validation.email" class="error-block">@{{ form.validation.email[0] }}</span>
                        </div>
                        <div class="col-md-6 mt-3">
                            <label for="details">رقم الواتساب</label>
                            <input class="form-control mobile" placeholder="رقم الواتساب" v-model="whatsapp" value="">
                            <span v-if="form.validation && form.validation.whatsapp" class="error-block">@{{ form.validation.whatsapp[0] }}</span>
                        </div>
                        <div class="col-md-12 mt-3 text-center">
                            <button  @click="applyJob" :form="form.disabledButton" class="apply_job btn btn-warning">إرسال طلب</button>
                        </div>
                    </div>
                </application-career-form>
            </div>
            <div class="col-md-7 col-lg-7">
                <div class="single-post d-flex flex-row">
                    <div class="details">
                        <div class="title d-flex flex-row justify-content-between">
                            <div class="titles">
                                <h4>{{$career->title}}</h4>
                                <h6>{{$career->job_title}}</h6>
                            </div>
                        </div>
                        <p>طبيعة العمل :  {{$career->workplace_type}} </p>
                        <p>طبيعة الدوام  :  {{$career->type}} </p>
                        <p class="address"><span class="fas fa-database"></span> {{$career->min_salary}} - {{$career->max_salary}}</p>
                    </div>
                </div>
                <div class="single-post d-flex flex-row">

                    <div class="details">
                        <div class="title d-flex flex-row justify-content-between"><div class="titles"><h4>الخبرات</h4></div></div>
                        <p style="white-space: pre-line">{!! $career->experience !!}</p>
                    </div>
                </div>
                <div class="single-post d-flex flex-row">
                    <div class="details">
                        <div class="title d-flex flex-row justify-content-between">
                            <div class="titles"><h4>المسؤوليات</h4></div>
                        </div>
                        <p style="white-space: pre-line">{!! $career->responsibilities !!}</p>
                    </div>
                </div>
                <div class="single-post d-flex flex-row">
                    <div class="details">
                        <div class="title d-flex flex-row justify-content-between">
                            <div class="titles"><h4>المهام</h4></div>
                        </div>
                        <p style="white-space: pre-line">{!! $career->tasks !!}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
