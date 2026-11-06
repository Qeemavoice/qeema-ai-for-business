<!-- div 3 -->
<div class="multisteps-form__panel step-3" id="step_3" data-animation="animate__bounce">
    <div class="wizard-forms">
        <div class="inner pb-100 clearfix">
            <div class="form-content pera-content">
                <div class="step-inner-content">
                    <template v-if="type=={{\App\Models\UserType::CLIENT}}">
                        <h2>ما هو مجال عملك ؟ </h2>
                        <div class="budget-area">
                            <div class="opti-list">
                                <ul class="">
                                    @foreach($data['workFields'] as $key => $work)
                                        <li class="bg-white" @click="checkedWorkField({{$work->id}})" id="work_{{$work->id}}"><input type="checkbox"/>{{$work->name}}</li>
                                    @endforeach
                                    <li @click="checkedOtherWorkField" id="work_0" class="bg-white"><input type="checkbox"/> {{trans_app('other')}}  </li>
                                </ul>
                            </div>
                            <div class="form-inner-area d-none" id="div_work_other" style="margin-top: 0;">
                                <input type="text" v-model="work_field"  placeholder=" اذكر مجال عملك  " required/>
                                <span v-if="form.validation&&form.validation.work_field" class="error-block">@{{ form.validation.work_field[0] }}</span>

                            </div>
                            <span v-if="form.validation&&form.validation.work_fields" class="error-block">@{{ form.validation.work_fields[0] }}</span>
                        </div>
                    </template>
                    <template v-else>
                        <h2> {{trans_app('enter_the_following_data')}} </h2>
                        <div class="form-inner-area">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="language-select">
                                        <select v-model="gender" class="gender form-control mb-3" id="gender" name="gender" required="" style="height:70px">
                                            <option value="">الجنس</option>
                                           @foreach($data['genders'] as $gender)
                                                <option value="{{$gender->id}}">{{$gender->name}}</option>
                                            @endforeach
                                        </select>
                                        <span v-if="form.validation&&form.validation.gender" class="error-block">@{{ form.validation.gender[0] }}</span>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="language-select">
                                        <select v-model="country" class="gender form-control mb-3" id="country" name="country" required="" style="height:70px">
                                            <option value="">الدولة</option>
                                            @foreach($data['countries'] as $country)
                                                <option value="{{$country->id}}">{{$country->name}}</option>
                                            @endforeach
                                        </select>
                                        <span v-if="form.validation&&form.validation.country" class="error-block">@{{ form.validation.country[0] }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-12">
                                    <input type="text" v-model="whatsapp_number" name="whatsapp_number"  class="required" placeholder="  رقم الواتساب" required="">
                                    <span v-if="form.validation&&form.validation.whatsapp_number" class="error-block">@{{ form.validation.whatsapp_number[0] }}</span>
                                </div>
{{--                                <div class="col-md-6">--}}
{{--                                    <input type="url" v-model="business_link" name="business_link" id="business_link" class="required" placeholder="رابط الأعمال">--}}
{{--                                    <span v-if="form.validation&&form.validation.business_link" class="error-block">@{{ form.validation.business_link[0] }}</span>--}}
{{--                                </div>--}}
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <input type="price" v-model="price_per_minute" name="price_per_minute" id="price_per_minute" class="required" placeholder="سعر الدقيقة بالدولار " required="">
                                    <span v-if="form.validation&&form.validation.price_per_minute" class="error-block">@{{ form.validation.price_per_minute[0] }}</span>
                                </div>
                                <div class="col-md-6">
                                    <input type="price" v-model="price_per_hours" name="price_per_hours" id="hour_price" class="required" placeholder="سعر الساعة بالدولار " required="">
                                    <span v-if="form.validation&&form.validation.price_per_hours" class="error-block">@{{ form.validation.price_per_hours[0] }}</span>
                                </div>
                            </div>
                            <div class="row">
{{--                                <div class="col-md-6">--}}
{{--                                    <div class="language-select">--}}
{{--                                        <select class="delivery form-control " id="delivery" name="delivery" required="">--}}
{{--                                            <option value="">مدة التسليم</option>--}}
{{--                                            <option value="1">24 ساعة</option>--}}
{{--                                            <option value="2">يومين</option>--}}
{{--                                            <option value="3">3 أيام</option>--}}
{{--                                        </select>--}}
{{--                                    </div>--}}
{{--                                </div>--}}
{{--                                <div class="col-md-6">--}}
{{--                                    <div class="language-select">--}}
{{--                                        <select class="payment_way form-control" id="payment_way" name="payment_way" required="">--}}
{{--                                            <option value="">استلام الأرباح</option>--}}
{{--                                            <option value="باي بال">باي بال </option>--}}
{{--                                            <option value="بنكي">بنكي</option>--}}
{{--                                            <option value="بايونير">بايونير </option>--}}
{{--                                            <option value="فودافون كاش">فودافون كاش </option>--}}
{{--                                            <option value="حوالة مكتبية"> حوالة مكتبية</option>--}}
{{--                                        </select>--}}
{{--                                    </div>--}}
{{--                                </div>--}}
                            </div>
                            <h6>بالنقر على تسجيل فإنك توافق على شروط وسياسات منصة قيمة فويس</h6>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <div class="actions" style="float: left;">
            <ul style="justify-content: end;">
                <li><a href="javascript:;" @click="prevStep3ToStep2Button" title="BACK"> <span class="js-btn-prev"  ><i class="fa fa-arrow-right"></i> الى الوراء  </span></a></li>
                <li><button type="button" @click="doRegister" :disabled="form.disabledButton" title="تسجيل">{{trans_app('registration')}}</button></li>
            </ul>
        </div>
    </div>
</div>
