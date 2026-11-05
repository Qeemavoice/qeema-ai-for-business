@extends('admin_panel.layouts.app')

@push('page-title')
    {{ meta('breadcrumbs-title') }}
@endpush

@section('content')
    <setting-payment-methods-index :page="'{{$page}}'" :payment-methods="{{ isset($paymentMethods) ? json_encode($paymentMethods) : 'null' }}" inline-template>
        <div>
            @include('admin_panel.settings.payment-methods.includes.tabs')
            <div class="row g-xxl-12">
                <div class="col-xxl-12">
                    <div class="card card-xxl-stretch mb-5 mb-xl-10">
                        <div class="tab-content">
                            @include('admin_panel.settings.payment-methods.includes.form-stripe')
                            @include('admin_panel.settings.payment-methods.includes.form-paypal')
                            @include('admin_panel.settings.payment-methods.includes.form-cash')
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </setting-payment-methods-index>
@endsection


@push('before_js')
<script>
    let PAYPAL = {{ \App\Models\PaymentMethod::PAYPAL }};
    let STRIPE = {{ \App\Models\PaymentMethod::STRIPE }};
    let CASH  = {{ \App\Models\PaymentMethod::CASH  }};
    let BANK_TRANSFER  = {{ \App\Models\PaymentMethod::BANK_TRANSFER  }};
</script>
@endpush
