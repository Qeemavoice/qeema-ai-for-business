<!-- div 2 -->
<div class="multisteps-form__panel" id="step_2" data-animation="animate__bounce">
    <div class="wizard-forms">
        <div class="inner pb-100 clearfix">
            <div class="form-content pera-content">
                <div class="step-inner-content">
                    <h2> قم بإدخال البيانات التالية </h2>
                    <div class="form-inner-area">
                        <input type="text" v-model="full_name" id="full_name" class="required" placeholder=" الاسم " required/>
                        <span v-if="form.validation&&form.validation.full_name" class="error-block">@{{ form.validation.full_name[0] }}</span>
                        <input type="email" v-model="email" id="email" class="required" placeholder=" البريد الكتروني" required/>
                        <span v-if="form.validation && form.validation.email" class="error-block">@{{ form.validation.email[0] }}</span>
                        <input type="password" v-model="password"  id="pass" class="required" placeholder=" كلمة المرور" required/>
                        <span v-if="form.validation && form.validation.password" class="error-block">@{{ form.validation.password[0] }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="actions" style="float: left;">
            <ul style="justify-content: end;">
                <li><a href="javascript:;" @click="prevButton" title="الى الوراء"> <span class="js-btn-prev"><i class="fa fa-arrow-right"></i> الى الوراء</span></a></li>
                <li id="button_next"><a href="javascript:;" @click="nextButton"><span class="js-btn-next" title="التالي">  التالي<i class="fa fa-arrow-left"></i></span></a> </li>
                <li id="button_submit" class="d-none">
                    <!--<span class="js-btn-next" title="NEXT">NEXT <i class="fa fa-arrow-left"></i></span>-->
                    <button type="button" @click="doRegister" title="تسجيل"> تسجيل</button>
                </li>
            </ul>
        </div>
    </div>
</div>
