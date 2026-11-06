@extends('app.layouts.app')

@push('page-title',meta('page-title'))

@section('content')
    <div class="container contact-us-page">

        @include('app.layouts.includes.nav')
        @include('app.layouts.includes.breadcrumbs')

        <booking-voice-form :voice="{{isset($voice) ? json_encode($voice) : 'null'}}"
                            :user="{{json_encode(user() ? ['full_name' => user()->full_name , 'email' => user()->email] : null)}}"
                            inline-template>
            <div class="booking-form" v-loading="form.loadingDisplay">
                <form class="needs-validation" >
                    <div class="row">
                        <div class="col-sm-12 col-md-12 col-lg-9">
                            <div class="single-form">
                                <div class="booking-form-modle">
                                    <h6>تفاصيل الحساب</h6>
                                    <div class="row">
                                        <div class="col-6">
                                            <div class="form-group">
                                                <label for="uname">الاسم<span class="required">*</span></label>
                                                <input type="text" class="form-control" v-model="full_name" required {{ user() ? 'readonly' : ''}} >
                                                <span v-if="form.validation && form.validation.full_name" class="error-block">@{{ form.validation.full_name[0] }}</span>
                                                <div class="invalid-feedback">الرجاء تعبئة الحقل.</div>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="form-group">
                                                <label for="mail">البريد الإلكتروني<span class="required">*</span></label>
                                                <input type="email" class="form-control" v-model="email" {{user() ? 'readonly' : ''}} placeholder="" required style="text-align: left;">
                                                <span v-if="form.validation && form.validation.email" class="error-block">@{{ form.validation.email[0] }}</span>
                                                <div class="invalid-feedback">الرجاء تعبئة الحقل.</div>
                                            </div>
                                        </div>

                                        @if(!user())
                                            <div class="col-12">
                                                <div class="form-group">
                                                    <label>
                                                    <input type="checkbox" v-model="do_not_account" class="form" style="height: 1rem;width: 1rem;"/>
                                                        ليس لديك حساب ؟
                                                    </label>
                                                </div>
                                                <div class="alert alert-warning">قم بإنشاء حساب عن طريق إدخال المعلومات أدناه. إذا كنت أحد العملاء العائدين، يرجى تسجيل الدخول من أعلى الصفحة. </div>
                                            </div>
                                        <template v-if="do_not_account">
                                            <div class="col-sm-12 col-md-6">
                                                <div class="form-group">
                                                    <label for="password"> كلمة المرور <span class="required">*</span></label>
                                                    <input type="password"  class="form-control" id="password">
                                                </div>
                                            </div>
                                            <div class="col-sm-12 col-md-6">
                                                <div class="form-group">
                                                    <label for="confirm_password"> تأكيد كلمة المرور <span class="required">*</span></label>
                                                    <input type="password"  class="form-control" id="confirm_password">
                                                </div>
                                            </div>
                                        </template>
                                        @endif
                                    </div>
                                </div>
                            </div>
                            <div class="single-form mt-3">
                                <div class="booking-form-modle">
                                    <h6>بيانات الحجز</h6>
                                    <div class="row">
                                        <div class="col-sm-12 col-md-6">
                                            <div class="form-group">
                                                <label for="sel1"> اللغة <span class="required">*</span></label>
                                                <input type="text" value="{{$voice->language->name}}" class="form-control" readonly>
                                                {{--                                                <select name="language_id" readonly="readonly" class="form-control" id="sel1" required>--}}
                                                {{--                                                    <option selected value="">اختر</option>--}}
                                                {{--                                                    <option selected value="1">اللغة العربية</option>--}}
                                                {{--                                                </select>--}}
                                            </div>
                                        </div>
                                        <div class="col-sm-12 col-md-6">
                                            <div class="form-group">
                                                <label for="spelling"> اللهجة <span class="required">*</span></label>
                                                {{--                                                <select name="dialect_id" readonly="readonly" class="form-control" id="spelling" required>--}}
                                                {{--                                                    <option selected value="1">السعودية</option>--}}
                                                {{--                                                </select>--}}
                                                <input type="text" value="{{$voice->dialect->name}}" class="form-control" readonly>

                                            </div>
                                        </div>
                                        <div class="col-sm-12 col-md-6">
                                            <div class="form-group">

                                                <label for="byWho">المؤدي<span class="required">*</span></label>
                                                <input type="text" value="{{$voice->show_type}}" class="form-control" readonly>
                                                {{--                                                <select name="type" readonly="readonly" class="form-control" id="byWho" required>--}}
                                                {{--                                                    <option selected value="2">رجل</option>--}}
                                                {{--                                                </select>--}}
                                            </div>
                                        </div>
                                        <div class="col-sm-12 col-md-6">
                                            <div class="form-group">
                                                <label for="spelling">  اللون الصوتي  <span class="required">*</span></label>
                                                <input type="text" value="{{$voice->categories[0]->category->name}}" class="form-control" readonly>
                                                {{--                                                <select name="category_id" readonly="readonly"  class="form-control category_id" required>--}}
                                                {{--                                                    <option selected value="1">تعليق صوتي إعلان</option>--}}
                                                {{--                                                </select>--}}
                                            </div>
                                        </div>
                                        <div class="col-sm-12 col-md-12">
                                            <div class="form-group">
                                                <label for="whatsapp_number"> رقم الواتس آب <span class="required">*</span></label>
                                                <input type="number" v-model="whatsapp_number" class="form-control" id="whatsapp_number"  value="212"  placeholder=" رقم الواتس آب" name="whatsapp_number" required style="text-align: right;">
                                                <span v-if="form.validation && form.validation.whatsapp_number" class="error-block">@{{ form.validation.whatsapp_number[0] }}</span>
                                                <div class="invalid-feedback">الرجاء تعبئة الحقل.</div>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <div class="form-group">
                                                <label for="senario">السيناريو<span class="required">*</span></label>
                                                <textarea name="scenario" v-model="scenario" class="form-control" id="senario" required></textarea>
                                                <span class="note">ملاحظة: الدقيقة تعادل 100 كلمة باللغة العربية</span>
                                                <br>
                                                <span v-if="form.validation && form.validation.scenario" class="error-block">@{{ form.validation.scenario[0] }}</span>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <div class="form-group">
                                                <label for="senario">تعليمات للمعلق الصوتي</label>
                                                <textarea name="note_for_actor" v-model="notes" class="form-control" id="nots"></textarea>
                                                {{--                                                <span class="note">* كافة الحقول مطلوبة </span>--}}
                                                <span v-if="form.validation && form.validation.notes" class="error-block">@{{ form.validation.notes[0] }}</span>
                                            </div>
                                        </div>
                                        <div class="col-md-12"><h6>خدمات أخرى</h6></div>
                                        @foreach($services as $service)
                                            <div class="col-md-12 col-lg-12">
                                                <label for="service_{{$service->id}}">
                                                    <input type="checkbox" v-model="services" value="{{$service}}" id="service_{{$service->id}}" data-type="{{$service->type}}" data-price="{{$service->value}}" style="margin-left: 5px;margin-right: 5px;cursor: pointer;" class="service">
                                                    {{$service->title}}
                                                </label>
                                            </div>
                                        @endforeach
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-12 col-md-12 col-lg-4">
                            <div class="single-form cnt">
                                <div class="sound-details">
                                    <div class="recorder" >
                                        <a class="showSingle showSingle2" target="1"><i class="fas fa-play" style="color:#fff"></i></a>
                                        <div id="div1" class="targetDiv">
                                            <audio controlslist="nodownload" src="{{$voice->audio_file_url}}" controls="true" class="ppbutton fa fa-play"></audio>
                                        </div>
                                    </div>
                                    <div class="soundName">
                                        <div class="row">
                                            <div class="col-8"><span class="name">{{$voice->title}}</span></div>
                                            <div class="col-4"><span class="price">{{$voice->show_total_price}}/دقيقة</span></div>
                                        </div>
                                    </div>
                                    <div class="soundStatics">
                                        <div class="row">
                                            <div class="col-8"><span class="code"> عدد الكلمات </span></div>
                                            <div class="col-4"><span class="likes">@{{ numberOfScenarioWords }}</span> كلمة </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-8"><span class="sType">السعر للدقيقة الواحدة</span></div>
                                            <div class="col-4"><span class="likes">{{$voice->show_total_price}}</span></div>
                                        </div>
                                        <div class="row">
                                            <div class="col-8"><span class="sType"> عدد الدقائق </span></div>
                                            <div class="col-4"><span class="likes"  id="minitscount">@{{ numberOfMinutesScenario }}</span> دقيقة </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-8"><span class="sType"> سعر العمل كامل </span></div>
                                            <div class="col-4"><span class="likes" id="totalall">{{$currency}}@{{ total }}</span></div>
                                        </div>
                                    </div>
                                    <div class="price total-price">
                                        <div class="row" >
                                            <div class="col-8" ><span class="code">المبلغ المستحق للدفع </span></div>
                                            <div class="col-4"><span class="likes" id="total">{{$currency}}@{{ total }}</span></div>
                                        </div>
                                    </div>

                                    <div class="reserve">
                                        <div class="row">
                                            <div class="col-12"  style="width: 100%; border-left: 1px solid #fff;">
                                                <button type="button" @click="payment" :disabled="form.disabledButton" class="btn">ادفع الآن </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
                <payment-form></payment-form>
            </div>
        </booking-voice-form>
    </div>
@endsection

{{--@push('css')--}}
{{--    <style>--}}
{{--        @media (min-width: 1900px) {--}}
{{--            .recorder {--}}
{{--                width: 82%!important;--}}
{{--                background-repeat: repeat-x;--}}
{{--            }--}}
{{--        }--}}
{{--        @media (min-width: 1600px) {--}}
{{--            .recorder {--}}
{{--                width: 82%!important;--}}
{{--                background-repeat: repeat-x;--}}
{{--            }--}}
{{--        }--}}
{{--    </style>--}}
{{--@endpush--}}

