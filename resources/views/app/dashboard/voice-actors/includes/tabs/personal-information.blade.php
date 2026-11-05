<div class="tab-pane fade in active show" id="personal-information" role="tabpanel" aria-labelledby="personal-information-tab">
    <voice-actor-profile-index :user="{{isset($user) ? json_encode($user) : 'null'}}"
                   :user-image-default="`{{user_app_image_default()}}`" inline-template>
        <div class="card card-main">
            <div class="card-header"><h4> البيانات الشخصية<a title=" تعديل بياناتي" @click="showEditProfileModal" class="pull-right update editProfile" href="javascript:void(0);"><i class="fa fa-edit"></i></a></h4></div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-borderless">
                        <tbody>
                        <tr>
                            <td><b>الاسم :</b></td>
                            <td>{{user()->full_name}}</td>
                        </tr>
                        <tr>
                            <td><b>البريد الالكتروني :</b></td>
                            <td class="p_email">{{user()->email}}</td>
                        </tr>
                        <tr>
                            <td><b>رقم الجوال :</b></td>
                            @if(user()->profile&&user()->profile->whatsapp_number)
                            <td class="p_mobile">{{user()->profile ?  user()->profile->whatsapp_number : '-'}}</td>
                            @else
                                <td class="p_mobile">-</td>
                            @endif
                        </tr>
                        <tr>
                            <td><b> الدولة :</b></td>
                            @if(user()->profile&&user()->profile->country)
                                <td class="p_address">{{user()->profile->country->name}}</td>
                            @else
                                <td class="p_address">-</td>
                            @endif
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="modal_edit_profile" class="modal fade " role="dialog" style="z-index: 9999999;">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" v-loading="form.loadingDisplay">
                        <form role="form" action="#" method="post" class="form_editProfile" id="form_editProfile">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLabel"> تعديل بياناتي </h5>
                                <button type="button" class="close" data-dismiss="modal" style="margin-left: 0;">&times;</button>
                            </div>
                            <div class="modal-body">
                                <form class="form-group m-form__group row">
                                    <div class="col-md-12 mb-3">
                                        <label> الاسم رباعي <span class="required">*</span></label>
                                        <div class="form-valid">
                                            <input type="text" v-model="full_name" class="form-control name" placeholder="الاسم رباعي" autocomplete="off">
                                            <span v-if="form.validation&&form.validation.full_name" class="error-block">@{{ form.validation.full_name[0] }}</span>
                                        </div>
                                    </div>
                                    <div class="col-md-12 mb-3">
                                        <label> البريد الالكتروني <span class="required">*</span></label>
                                        <div class="form-valid">
                                            <input type="text" v-model="email" class="form-control email"  placeholder="البريد الالكتروني " autocomplete="off">
                                            <span v-if="form.validation&&form.validation.email" class="error-block">@{{ form.validation.email[0] }}</span>
                                        </div>
                                    </div>
                                    <div class="col-md-12 mb-3">
                                        <label>  رقم الواتس آب <span class="required">*</span></label>
                                        <div class="form-valid">
                                            <input type="text" v-model="whatsapp_number" class="form-control mobile" placeholder="رقم الواتس آب " autocomplete="off">
                                            <span v-if="form.validation&&form.validation.whatsapp_number" class="error-block">@{{ form.validation.whatsapp_number[0] }}</span>
                                        </div>
                                    </div>
                                    <div class="col-md-12 mb-3">
                                        <label>  الدولة <span class="required">*</span></label>
                                        <div class="form-valid">
                                            <div class="language-select">
                                                <select v-model="country" class="gender form-control mb-3" id="country"  required>
                                                    <option value="">الدولة</option>
                                                    @foreach($data['countries'] as $country)
                                                        <option value="{{$country->id}}">{{$country->name}}</option>
                                                    @endforeach
                                                </select>
                                                <span v-if="form.validation&&form.validation.country" class="error-block">@{{ form.validation.country[0] }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-12 mb-3">
                                        <label>  الصورة الشخصية <span class="required">*</span></label>
                                        <div class="form-valid">
                                            <div>
                                                <button @click="toggleShow()" type="button" class="btn btn-primary" style="width: 27.2rem;">
                                                    <span class="fa fa-upload"></span>
                                                    {{ trans_app('upload') }}
                                                </button>
                                                <my-upload field="img"
                                                           @crop-success="cropSuccess"
                                                           @crop-upload-success="cropUploadSuccess"
                                                           @crop-upload-fail="cropUploadFail"
                                                           v-model="show_image_crop_upload"
                                                           :width="70"
                                                           :height="70"
                                                           :url="'/uploads/uploadFileOnCrop/{{$DIR_FILE_UPLOADS}}'"
                                                           :headers="$headers"
                                                           :lang-type="$lang"
                                                           :no-square="true">
                                                </my-upload>
                                                <div class="error-block" v-if="form.validation && form.validation.personal_photo">@{{ form.validation.personal_photo[0] }}</div>
                                                <img v-if="imgDataUrl" :src="imgDataUrl" style="margin-left: 5%;">
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" @click="updateProfile" :disabled="form.disabledButton" style="margin-left: 10px; background: #FEA107;" class="btn btn-primary btn_save_page"> حفظ التعديلات</button>
                                <button type="button" class="btn btn-secondary " data-dismiss="modal"> الغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </voice-actor-profile-index>
</div>
