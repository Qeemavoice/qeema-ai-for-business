@extends('admin_panel.layouts.app')

@push('page-title')
    {{meta('breadcrumbs-title') .' - '. $pageTitle}}
@endpush

@section('content')
    <profit-form :profit="{{ isset($profit) ? $profit : 'null'}}"
                inline-template>
        <form id="kt_ecommerce_add_product_form" class="form d-flex flex-column flex-lg-row" data-kt-redirect="">
            <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
                <div class="d-flex flex-column gap-7 gap-lg-10">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">
                                <h2>{{ $pageTitle }}</h2>
                            </div>
                        </div>
                        <div class="card-body">
                           <div class="row">
                               <div class="col-lg-6 mb-8">
                                   <label for="voiceover" class="form-label mb-2">{{trans_admin('voice_actor')}}</label>
                                   <el-select v-model="voiceover"
                                              filterable
                                              remote
                                              :loading="form.loadingVoiceActorList"
                                              :remote-method="searchVoiceOvers"
                                              class="w-100" no-data-text="{{trans_admin('no_data')}}"
                                              placeholder="{{trans_admin('select_voice_actor')}}">
                                       <el-option v-for="(voiceover,v) in voiceovers"
                                                  :key="voiceover ? voiceover.id : ''"
                                                  :value="voiceover ? voiceover.id : ''"
                                                  :label="voiceover ? voiceover.full_name[$lang] : ''">
                                       </el-option>
                                   </el-select>
                                   <span v-if="form.validation && form.validation.voiceover" class="error-block">@{{ form.validation.voiceover[0] }}</span>
                               </div>
                               <div class="col-lg-6 mb-8">
                                   <label for="amount" class="form-label mb-2">{{trans_admin('amount')}}</label>
                                   <input type="text" v-model="amount" id="amount"  value="" class="form-control">
                                   <span v-if="form.validation && form.validation.amount" class="error-block">@{{ form.validation.amount[0] }}</span>
                               </div>
                           </div>
                          <div class="row">

                              <div class="mb-8 col-md-6">
                                  <label for="transaction_id" class="form-label mb-2">{{trans_admin('transaction_id')}}</label>
                                  <input type="text" v-model="transaction_id" id="transaction_id" class="form-control">
                                  <span v-if="form.validation&&form.validation['transaction_id']" class="error-block">@{{ form.validation['transaction_id'][0] }}</span>
                              </div>
                              <div class="col-lg-6 mb-8">
                                  <label for="payment_method" class="form-label mb-2">{{trans_admin('withdrawal_method')}}</label>
                                  <select v-model="withdrawal_method" class="form-select mb-2" id="type">
                                      <option value="">{{trans_admin('select_an_option')}}</option>
                                      @foreach($withdrawalMethod as $key => $value)
                                          <option value="{{$value->id}}">{{$value->name}}</option>
                                      @endforeach
                                  </select>
                                  <span v-if="form.validation && form.validation.withdrawal_method" class="error-block">@{{ form.validation.withdrawal_method[0] }}</span>
                              </div>
                          </div>
                            <div class="mb-8 col-md-12">
                                <label class="d-flex align-items-center fs-5 fw-bold mb-2">
                                    <span class="required">{{trans_admin('receipt')}}</span>
                                </label>
                                <upload-file :_file.sync="receipt"
                                             placeholder="{{trans_admin('receipt')}}"
                                             :dir="'{{\App\Models\Transaction::DIR_FILES_UPLOAD}}'"
                                             id='receipt'
                                             :type-extension="['jpg', 'jpeg', 'png']"
                                             div-id='div-receipt'>
                                </upload-file>
                                <span v-if="form.validation&&form.validation['receipt']" class="error-block">@{{ form.validation['receipt'][0] }}</span>
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
    </profit-form>
@endsection


