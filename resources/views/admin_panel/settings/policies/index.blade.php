
@extends('admin_panel.layouts.app')

@push('page-title')
    {{ meta('breadcrumbs-title') }}
@endpush

@section('content')
    <setting-policies-form :page="'{{$page}}'" :settings="{{ isset($settings) ? json_encode($settings) : 'null' }}" inline-template>
        <div class="d-flex flex-column flex-row-fluid gap-7 gap-lg-10">
            <div class="d-flex flex-column gap-7 gap-lg-10">
                <div class="card">
                    <div class="card-header cursor-pointer">
                        <div class="card-title">
                            <h2>{{ meta('breadcrumbs-title') }}</h2>
                            <div class="separator"></div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="fv-row w-100 flex-md-root">
                            <div class="row">
                                <div class="col-md-6">
                                    <label for="fee_app" class="form-label mb-2">عدد الأيام المخصصة لحجز مدفوعات المعلق الصوتي</label>
                                    <input type="number" v-model="payment_hold_days_voice_actor" class="form-control"  placeholder=" ">
                                    <span class="form-control-feedback error-block" v-if="form.validation && form.validation.payment_hold_days_voice_actor">@{{ form.validation.payment_hold_days_voice_actor[0] }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-end">
                @include('admin_panel.includes.buttons.cancel')
                @include('admin_panel.includes.buttons.save')
            </div>
        </div>
    </setting-policies-form>
@endsection



