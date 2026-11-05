<template>
    <div id="modal_payment" v-loading="form.loadingDisplay" class="modal fade onloadMessage" role="dialog" style="z-index: 9999999;">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"> ادفع الآن </h5>
                    <button class="close" data-dismiss="modal" style="margin-left: 0;" type="button">&times;</button>
                </div>
                <div class="modal-body" style="padding: 1.5rem;">
                    <form id="form_stripe" :data-stripe-publishable-key="config.stripe.key" class="require-validation"
                          data-cc-on-file="false" method="post" role="form">
                        <div class="price total-price">
                            <div class="row">
                                <div class="col-md-8">
                                    <div class="row" style="border-left: 1px solid #ddd;">
                                        <div class="col-sm-12 col-md-12">
                                            <div class="form-group">
                                                <label for="card_full_name"> الاسم </label>
                                                <input id="card_full_name" v-model="card.full_name" autocomplete='off' class="form-control name-card" placeholder='اسم صاحب البطاقة' size='4' style="text-align: right;" type="text">
                                                <span v-if="form.validation && form.validation['card.full_name']" class="error-block">{{ form.validation['card.full_name'][0] }}</span>
                                            </div>
                                        </div>
                                        <div class="col-sm-12 col-md-12">
                                            <div class="form-group">
                                                <label for="card_number"> رقم البطاقة </label>
                                                <input id="card_number" v-model="card.number" v-mask="'####-####-####-####-###'" autocomplete='off' class="form-control card-number" placeholder="xxxx - xxxx - xxxx - xxxx" size='20' style="text-align: right;" type="text">
                                                <span v-if="form.validation && form.validation['card.number']" class="error-block">@{{ form.validation['card.number'][0] }}</span>
                                            </div>
                                        </div>
                                        <div class="col-sm-4 col-md-4">
                                            <div class="form-group">
                                                <label for="card_cvc"> كود الأمان </label>
                                                <input id="card_cvc" v-model="card.cvc" v-mask="'####'" autocomplete='off' class="form-control card-cvc" placeholder=' كود الأمان ' size='4' style="text-align: right;" type="text">
                                                <span v-if="form.validation && form.validation['card.cvc']" class="error-block">@{{ form.validation['card.cvc'][0] }}</span>
                                            </div>
                                        </div>
                                        <div class="col-sm-4 col-md-4">
                                            <div class="form-group">
                                                <label for="card_month"> الشهر </label>
                                                <input id="card_month" v-model="card.expiry_month" v-mask="'##'" autocomplete='off' class="form-control card-expiry-month" placeholder='الشهر' size='4' style="text-align: right;" type="text">
                                                <span v-if="form.validation && form.validation['card.expiry_month']" class="error-block">@{{form.validation['card.expiry_month'][0]}}</span>
                                            </div>
                                        </div>
                                        <div class="col-sm-4 col-md-4">
                                            <div class="form-group">
                                                <label for="card_expiry_year"> السنه </label>
                                                <input id="card_expiry_year" v-model="card.expiry_year" v-mask="'##'" autocomplete='off' class="form-control card-expiry-year" placeholder='السنة' size='4' style="text-align: right;" type="text">
                                                <span v-if="form.validation && form.validation['card.expiry_year']" class="error-block">@{{ form.validation['card.expiry_year'][0] }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="order" class="col-md-4">
                                    <div class="form-group">
                                        <table border-collapse="collapse" width="100%">
                                            <tr class="payment-border">
                                                <td><h5>الملخص</h5></td>
                                            </tr>
                                            <tr>
                                                <td class="pt-2"><span>سعر الدقيقة </span></td>
                                                <td class="pt-2"><span class="payment-m-l">{{order.voice.show_total_price }} </span></td>
                                            </tr>
                                            <tr>
                                                <td class="pt-2"><span>عدد الدقائق</span></td>
                                                <td class="pt-2"><span class="payment-m-l">{{order.number_of_minutes_scenario }} دقيقة</span></td>
                                            </tr>
                                            <tr>
                                                <td class="pt-2"><span>إجمالي سعر الدقائق</span></td>
                                                <td class="pt-2"><span class="payment-m-l">{{ $current_currency['symbol'] }}{{order.total_price_per_minute}} </span></td>
                                            </tr>
                                            <tr>
                                                <td class="pt-2"><span>إجمالي الخدمات الاضافية</span></td>
                                                <td class="pt-2"><span class="payment-m-l">{{ $current_currency['symbol'] }}{{order.services.total}}</span></td>
                                            </tr>
                                            <tr class="payment-border-top"></tr>
                                            <tr>
                                                <td class="pt-2"><span>إجمالي التكلفة</span></td>
                                                <td class="pt-2"><span class="payment-m-l">{{$current_currency['symbol']}}{{ order.sub_total }}</span></td>
                                            </tr>
                                            <tr v-if="order.coupon">
                                                <td class="pt-2"> الخصم ({{ order.coupon.value }}%)</td>
                                                <td class="pt-2"><span class="payment-m-l"> {{ $current_currency['symbol'] }}{{order.coupon.calculated_value}}</span></td>
                                            </tr>
                                            <tr>
                                                <td class="pt-2">عمولة بوابة الدفع({{ commissions['stripe'] }}%)</td>
                                                <td class="pt-2"><span class="payment-m-l">{{ $current_currency['symbol'] }}{{order.payment_method.calculated_value}}</span></td>
                                            </tr>
                                            <tr class="payment-border-top"></tr>
                                            <tr>
                                                <td class="pt-2"><b>المبلغ المطلوب دفعه</b></td>
                                                <td class="pt-2"><b class="payment-m-l">{{$current_currency['symbol']}}{{ order.totalToPaid }}</b></td>
                                            </tr>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <div class="col-md-12">
                        <div v-if="form.message_error" class="alert alert-danger">{{ form.message_error }}</div>
                        <div v-if="form.message_success" class="alert alert-success">{{ form.message_success }}</div>
                        <button :disabled="form.disabledButton" class="btn btn-primary btn-color-orange" type="button" @click="orderProcessing"> تأكيد الدفع</button>
                        <button class="btn btn-secondary" data-dismiss="modal" type="button">إغلاق</button>
                    </div>
                    <div class="col-md-12">
                        <img src="/app/assets/img/payment_cards.png" style="width:20%;float: left;">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "payment-form-for-booking",
    // provide() {
    //     return {
    //         _email: null,
    //         _redirectUrl: null,
    //     };
    // },
    data() {
        return {
            card: {
                full_name: '',
                number: '',
                cvc: '',
                expiry_month: '',
                expiry_year: '',
            },
            order: null,
            config: {
                stripe: {
                    key: '',
                }
            },
            payment_method: PAYMENT_METHOD_STRIPE,
            form: {
                message_error: null,
                message_success: null,
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            }
        }
    },
    props: {
        keyStripe: '',
        commissions: '',
        currency: '',
        pOrder: null,
    },
    watch: {},
    computed: {
    },
    mounted() {
        if (this.keyStripe) {
            this.config.stripe.key = this.keyStripe;
        }
        if (this.pOrder) {
            this.order = this.pOrder;
        }
        $('#modal_payment').on('hidden.bs.modal', (e) => {
            this.resetForm();
        });

        $('#modal_payment').on('show.bs.modal', (e) => {
            if (this.pOrder) {
                this.order = this.pOrder;
            }
        });

    },
    methods: {
        resetForm() {
            this.card = {
                full_name: '',
                number: '',
                cvc: '',
                expiry_month: '',
                expiry_year: '',
            };
            this.order = null;
        },
        orderProcessing() {
            if (this.validationForm()) {
                return false;
            }
            this.form.validation = null;
            this.form.message_error = null;

            if (this.payment_method === PAYMENT_METHOD_STRIPE) {
                this.payByStrip();
            }
        },
        payByStrip() {
            // this.form.loadingDisplay = this.$loading({
            //     lock: true,
            // });
            this.form.loadingDisplay = true;
            this.form.disabledButton = true;
            let $form = $('#form_stripe');


            if (!$form.data('cc-on-file')) {
                Stripe.setPublishableKey($form.data('stripe-publishable-key'));
                let stripe = Stripe.createToken({
                    number: this.card.number,
                    name: this.card.name,
                    exp_month: this.card.expiry_month,
                    exp_year: this.card.expiry_year,
                    cvc: this.card.cvc,
                }, this.stripeResponseHandler);
            }
        },
        stripeResponseHandler(status, response) {
            if (response.id) {
                this.saveOrder(response);
            } else if (response.error) {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                // this.form.loadingDisplay.close();
                this.form.message_error = response.error.message;
            }
        },
        saveOrder(response = null) {
            axios.post(this.$base_url + '/clients/booking', {
                stripeToken: response ? response.id : null,
                payment_method: this.payment_method,
                card: this.card,
                order: this.order,
            }).then(response => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                toastSuccess(response.data.message);
                if (this.$user) {
                    $('#modal_payment').modal('hide');
                    location.href = response.data.data.redirectTo;
                } else {
                    $('#modal_payment').modal('hide');
                    $('#modal_login').modal('show');

                }
            }).catch(error => {
                this.form.loadingDisplay = false;
                this.form.disabledButton = false;
                this.form.validation = error.response.data.errors;
                toastError(error);
            });
        },
        validationForm() {

        },
    }
}
</script>

