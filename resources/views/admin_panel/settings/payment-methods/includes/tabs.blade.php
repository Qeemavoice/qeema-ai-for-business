<div class="card mb-5 mb-xl-10">
    <div class="card-body pt-9 pb-0">
        <ul class="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bolder">
            <li class="nav-item mt-2">
                <a class="nav-link text-active-primary active ms-0 me-10 py-5" href="#stripe" @click="onTab(`{{ \App\Models\PaymentMethod::STRIPE }}`)" data-bs-target="#stripe" data-kt-countup-tabs="true" data-bs-toggle="tab">{{trans_admin('stripe')}}</a>
            </li>
{{--            <li class="nav-item mt-2">--}}
{{--                <a class="nav-link ms-0 me-10 py-5" href="#paypal" data-bs-target="#paypal" @click="onTab(`{{ \App\Models\PaymentMethod::PAYPAL }}`)" data-kt-countup-tabs="true" data-bs-toggle="tab">{{trans_admin('paypal')}}</a>--}}
{{--            </li>--}}
{{--            <li class="nav-item mt-2">--}}
{{--                <a class="nav-link ms-0 me-10 py-5" href="#cash" data-bs-target="#cash" @click="onTab(`{{ \App\Models\PaymentMethod::CASH }}`)" data-kt-countup-tabs="true" data-bs-toggle="tab">{{trans_admin('cache')}}</a>--}}
{{--            </li>--}}
        </ul>
    </div>
</div>
