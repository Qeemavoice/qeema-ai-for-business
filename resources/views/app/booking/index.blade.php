@extends('app.layouts.app')

@push('page-title',meta('page-title'))

@section('content')
    <div class="container contact-us-page">

        @include('app.layouts.includes.nav')
        @include('app.layouts.includes.breadcrumbs')
        @if(isset($banner)&&$banner)
            @include('app.layouts.includes.banner')
        @endif
        <booking-voice-form :voice="{{isset($voice) ? json_encode($voice) : 'null'}}"
                            :commissions="{{json_encode($commissions)}}"
                            :user="{{json_encode(user() ? ['full_name' => user()->full_name , 'email' => user()->email] : null)}}"
                            inline-template>
            <div class="booking-form" v-loading="form.loadingDisplay">
                <form class="needs-validation">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="col-sm-12 col-md-12 col-lg-12">
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
                                                    <span v-if="form.validation && form.validation.do_not_account" class="error-block">@{{ form.validation.do_not_account[0] }}</span>
                                                </div>
                                                <template v-if="do_not_account">
                                                    <div class="col-12"><div class="alert alert-warning">قم بإنشاء حساب عن طريق إدخال المعلومات أدناه. </div></div>
                                                    <div class="col-sm-12 col-md-6">
                                                        <div class="form-group">
                                                            <label for="password"> كلمة المرور <span class="required">*</span></label>
                                                            <input type="password" v-model="password" class="form-control" id="password">
                                                            <span v-if="form.validation && form.validation.password" class="error-block">@{{ form.validation['password'][0] }}</span>
                                                        </div>
                                                    </div>
                                                    <div class="col-sm-12 col-md-6">
                                                        <div class="form-group">
                                                            <label for="password_confirmation"> تأكيد كلمة المرور <span class="required">*</span></label>
                                                            <input type="password" v-model="password_confirmation" class="form-control" id="password_confirmation">
                                                            <span v-if="form.validation && form.validation.password_confirmation" class="error-block">@{{ form.validation.password_confirmation[0] }}</span>
                                                        </div>
                                                    </div>
                                                </template>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-sm-12 col-md-12 col-lg-12 mt-3">
                                <div class="single-form ">
                                    <div class="booking-form-modle">
                                        <h6>بيانات الحجز</h6>
                                        <div class="row">
                                            <div class="col-sm-12 col-md-6">
                                                <div class="form-group">
                                                    <label for="sel1"> اللغة <span class="required">*</span></label>
                                                    <input type="text" value="{{$voice->language->name}}" class="form-control" readonly>
                                                </div>
                                            </div>
                                            <div class="col-sm-12 col-md-6">
                                                <div class="form-group">
                                                    <label for="spelling"> اللهجة <span class="required">*</span></label>
                                                    <input type="text" value="{{$voice->dialect->name}}" class="form-control" readonly>
                                                </div>
                                            </div>
                                            <div class="col-sm-12 col-md-6">
                                                <div class="form-group">
                                                    <label for="byWho">المؤدي<span class="required">*</span></label>
                                                    <input type="text" value="{{isset($voice->voiceOver) ? $voice->voiceOver->full_name:null}}" class="form-control" readonly>
                                                </div>
                                            </div>
                                            <div class="col-sm-12 col-md-6">
                                                <div class="form-group">
                                                    <label for="spelling"> التصنيف الصوتي <span class="required">*</span></label>
                                                    <input type="text" value="{{$voice->categories[0]->category->name}}" class="form-control" readonly>
                                                </div>
                                            </div>
                                            <div class="col-sm-12 col-md-12">
                                                <div class="form-group">
                                                    <label for="whatsapp_number"> رقم الواتس آب <span class="required">*</span></label>
                                                    <input type="number" v-model="whatsapp_number" class="form-control" id="whatsapp_number" value="212" placeholder=" رقم الواتس آب" name="whatsapp_number" required style="text-align: right;">
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
                                                    <span v-if="form.validation && form.validation.notes" class="error-block">@{{ form.validation.notes[0] }}</span>
                                                </div>
                                            </div>
                                            <div class="col-md-12"><h6>خدمات أخرى</h6></div>
                                            @foreach($services as $service)
                                                <div class="col-md-12 col-lg-12">
                                                    <label for="service_{{$service->id}}">
                                                        <input type="checkbox" @click="setServices({{$service}})" value="{{$service}}" id="service_{{$service->id}}" data-type="{{$service->type}}" data-price="{{$service->value}}" style="margin-left: 5px;margin-right: 5px;cursor: pointer;" class="service">
                                                        {{$service->title}}
                                                    </label>
                                                </div>
                                            @endforeach
                                            <span v-if="form.validation && form.validation.services" class="error-block">@{{ form.validation.services[0] }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-sm-12 col-md-12 col-lg-4">
                            <div class="single-form cnt">
                                <div class="sound-details">

{{--                                        <a class="showSingle showSingle2" target="1"><i class="fas fa-play" style="color:#fff"></i></a>--}}
                                        <div class="targetDiv">
                                            <audio controlslist="nodownload" controls="true"  src="{{$voice->audio_file_url}}" class="ppbutton fa fa-play audio-class"></audio>
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
                                            <div class="col-4"><span class="likes">@{{ numberOfScenarioWords }}</span>
                                                كلمة
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-8"><span class="sType">السعر للدقيقة الواحدة</span></div>
                                            <div class="col-4"><span class="likes">{{$voice->show_total_price}}</span></div>
                                        </div>
                                        <div class="row">
                                            <div class="col-8"><span class="sType"> عدد الدقائق </span></div>
                                            <div class="col-4"><span class="likes" id="minitscount"> @{{ numberOfMinutesScenario }} </span> دقيقة </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-8"><span class="sType"> إجمالي سعر الدقائق </span></div>
                                            <div class="col-4"><span class="likes" id="total_price_per_minute">{{$currency}}@{{ totalPricePerMinute }}</span></div>
                                        </div>
                                        <div class="row">
                                            <div class="col-8"><span class="sType"> سعر الخدمات الإضافية </span></div>
                                            <div class="col-4"><span class="likes" id="services_price">{{$currency}}@{{ servicesPrice }}</span></div>
                                        </div>
                                    </div>
                                    <div class="soundStatics">
                                        <div class="form-group">
                                            <div class="d-flex">
                                                <input type="text" v-model="code" placeholder="ادخل كود الكوبون" class="form-control">
                                                <span class="input-group-append">
                                                    <button type="button" @click="applyCoupon" :disabled="form.disabledButton" class="btn btn-primary">تطبيق</button>
                                                    <button type="button" v-if="coupon" @click="removeCoupon" :disabled="form.disabledButton" class="btn btn-danger">
                                                        <i class="fa fa-trash"></i>
                                                    </button>
                                                </span>
                                            </div>
                                            <span v-if="form.validation && form.validation.code" class="error-block">@{{ form.validation.code[0] }}</span>
                                        </div>
                                    </div>
                                    <div class="price total-price">
                                        <div class="row">
                                            <div class="col-8"><span class="sType"> سعر العمل كامل </span></div>
                                            <div class="col-4"><span class="likes" id="totalall">{{$currency}}@{{ subTotal }}</span></div>
                                        </div>
                                        <div class="row" v-if="coupon">
                                            <div class="col-8">
                                                <span class="code">قيمة الخصم (@{{ coupon.value }}%)</span>
                                            </div>
                                            <div class="col-4"><span class="likes" id="total">{{$currency}}@{{ coupon.calculated_value }}</span></div>
                                        </div>

                                        <div class="row" >
                                            <div class="col-8">
                                                <span class="code">

                                                    عمولة بوابة الدفع  ( {{ $commissions->stripe }}%)
                                                </span>
                                            </div>
                                            <div class="col-4"><span class="likes" id="total">{{$currency}}@{{ totalCommission }}</span></div>
                                        </div>
                                    </div>
                                    <div class="price total-price" style="border-top: 1px solid #2F4858;">
                                        <div class="row">
                                            <div class="col-8"><span class="code">المبلغ المستحق للدفع </span></div>
                                            <div class="col-4"><span class="likes" style="color:#FEA107;" id="total">{{$currency}}@{{ totalToPaid }}</span></div>
                                        </div>
                                    </div>

                                    <div class="reserve">
                                        <div class="row">
                                            <div class="col-12" style="width: 100%; border-left: 1px solid #fff;">
                                                <template v-if="form.disabledPaymentButton">
                                                    <el-tooltip class="item" effect="dark" content="يرجى تعبئة الحقول الاجبارية" placement="top-start">
                                                        <button type="button" @click="payment" :disabled="form.disabledPaymentButton" class="btn">ادفع الآن</button>
                                                    </el-tooltip>
                                                </template>
                                                <template v-else>
                                                    <button type="button" @click="payment" :disabled="form.disabledPaymentButton" class="btn">ادفع الآن</button>
                                                </template>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
                <payment-form-for-booking
                    :p-order.sync="order"
                    :currency="`{{$currency}}`"
                    :commissions="{{json_encode($commissions)}}"
                    :key-stripe="`{{$keyStripe}}`">
                </payment-form-for-booking>
            </div>
        </booking-voice-form>
    </div>
@endsection

@push('js')
    <script src="https://js.stripe.com/v2/" defer></script>
@endpush

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

