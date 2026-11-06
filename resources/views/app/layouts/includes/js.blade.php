<script>
    let ROOT_URL = '<?php echo e(url('/')); ?>';
    let BASE_URL = '<?php echo e(url_lang('/')); ?>';
    let TOKN = '{{ csrf_token() }}';
    let USER = {!! auth()->check() ? user() : 'null' !!};
    let LANGUAGES = '<?php echo json_encode(languages()); ?>';
    let LANG = '<?php echo get_locale(); ?>';
    let APP_NAME = '<?php echo app_name(); ?>';
    let PAYMENT_METHOD_STRIPE = '<?php echo \App\Models\PaymentMethod::STRIPE ; ?>';
    let COMMISSIONS = '<?php echo json_encode(commissions()) ; ?>';
    let USER_TYPE_VOICE_ACTOR = <?php echo \App\Models\UserType::VOICE_ACTOR; ?>;
    let USER_TYPE_CLIENT = <?php echo \App\Models\UserType::CLIENT; ?>;
    let CURRENT_CURRENCY = <?php echo json_encode(\App\Services\CurrencyHelper::getCurrent()); ?>;
    let SUCCESS_MESSAGE = '<?php echo e(trans('messages.success')); ?>';
    let ERROR_MESSAGE = '<?php echo e(trans('messages.error')); ?>';
</script>


@stack('before_js')

<script src="{{asset_app('js/jquery3.3.1.js')}}"></script>
<script src="{{asset_app('js/popper.min.js')}}"></script>
<script src="{{asset_app('js/bootstrap.min.js')}}"></script>
<script src="{{asset_app('js/owl.carousel.min.js')}}"></script>
<script src="{{asset_app('js/wow.js')}}"></script>
{{--<script src="{{asset_app('js/contactform.js')}}" defer></script>--}}
<script src="{{asset_app('js/sweetalert.js')}}" defer></script>
{{--<script src="{{asset_app('js/main_wizard.js')}}"></script>--}}
<script src="{{asset_app('js/main.js')}}"></script>
<script src="{{asset_app('rating-star-icons/dist/rating.js')}}" defer></script>
<script src="{{asset_app('js/jquery.fancybox.js')}}"></script>

<script src="{{asset_app('js/custom.js')}}"></script>
<script src="{{asset('system/js/fee.js')}}"></script>
{{--<script src="https://js.pusher.com/8.4.0/pusher.min.js"></script>--}}

@isset($is_module)
    @stack('js_module')
@else
    @isset($enableVueAppAuth)
        <script src="{{ asset('js/app/auth.js') }}?v={{ filemtime(public_path('js/app/auth.js')) }}"></script>
    @else
        <script src="{{ asset('js/app/app.js') }}?v={{ filemtime(public_path('js/app/app.js')) }}"></script>
    @endif
@endif
@stack('js')




