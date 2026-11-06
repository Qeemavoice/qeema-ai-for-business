<div class="tab-pane fade in " id="work-fields" role="tabpanel" aria-labelledby="work-fields-tab">
   <work-fields-index :work-fields="{{isset($workFields) ? json_encode($workFields) : 'null'}}"
                      :work-field="{{isset($workField) ? json_encode($workField) : 'null'}}" inline-template>
       <div class="card card-main" v-loading="form.loadingDisplay">
           <div class="card-header"><h4> مجالات العمل </h4></div>
           <div class="card-body" id="wizard">
               <form id="update_clients_working">
                   <div class="form-area position-relative">
                       <div class="step-inner-content">
                           <div class="budget-area">
                               <div class="opti-list">
                                   <ul class="">
                                       @foreach($data['workFields'] as $key => $work)
                                           <li class="bg-white" @click="checkedWorkField({{$work->id}})" id="work_{{$work->id}}"><input type="checkbox"/>{{$work->name}}</li>
                                       @endforeach
                                       <li @click="checkedOtherWorkField" id="work_0" class="bg-white"><input type="checkbox"/> {{trans_app('other')}}  </li>
                                   </ul>
                               </div>
                               <div class="form-inner-area d-none" id="div_work_other" style="margin-top: 2rem; width: 51.1rem;">
                                   <input type="text" v-model="work_field"  placeholder=" اذكر مجال عملك  " required/>
                                   <span v-if="form.validation&&form.validation.work_field" class="error-block">@{{ form.validation.work_field[0] }}</span>

                               </div>
                               <span v-if="form.validation&&form.validation.work_fields" class="error-block">@{{ form.validation.work_fields[0] }}</span>
                           </div>
                       </div>
                       <div class="actions">
                           <ul style="justify-content: center;">
                               <li><button type="button" @click="update" :disabled="form.disabledButton" class="save-clients-working" title=" حفظ التعديلات ">حفظ التعديلات</button></li>
                           </ul>
                       </div>
                   </div>
               </form>
           </div>
       </div>
   </work-fields-index>
</div>
