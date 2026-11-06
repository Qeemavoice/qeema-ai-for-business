Vue.component('booking-voice-form', {
    data() {
        return {
            route: 'clients/booking',
            full_name: '',
            email: '',
            scenario: '',
            notes: '',
            whatsapp_number: '',
            services: [],
            payment_method: 'stripe',
            do_not_account: false,
            password: '',
            password_confirmation: '',
            code: '',
            coupon: null,
            form: {
                validation: null,
                disabledButton: false,
                disabledPaymentButton: true,
                loadingDisplay: false,
            },
            order: {
                voice: null,
                full_name: '',
                email: '',
                scenario: '',
                notes: '',
                whatsapp_number: '',
                do_not_account: false,
                password: '',
                password_confirmation: '',
                services: {
                    list: [],
                    sub_total_value: 0,
                    sub_total_percentage: 0,
                    total: 0,
                },
                number_of_scenario_words: 0,
                number_of_minutes_scenario: 0,
                total_price_per_minute: 0,
                coupon: null,
                payment_method: {
                    id: PAYMENT_METHOD_STRIPE,
                    name: 'stripe',
                    calculated_value: 0,
                    value: 0,
                },
                sub_total: 0,
                total: 0,
                totalToPaid: 0,
            },
        }
    },
    props: {
        user: null,
        voice: null,
        commissions: null,
    },
    watch: {
        full_name: function (val) {
            this.validationFullName();
            this.checkDisabledPaymentButton();
        },
        email: function (val) {
            this.validationEmail();
            this.checkDisabledPaymentButton();
        },
        whatsapp_number: function (val) {
            this.validationWhatsappNumber();
            this.checkDisabledPaymentButton();
        },
        scenario: function (val) {
            this.validationScenario();
            this.checkDisabledPaymentButton();
        },
        do_not_account: function (val) {
            this.checkDisabledPaymentButton();
        },
        services: function (val) {
            this.checkDisabledPaymentButton();
        },
        password: function (val) {
            this.validationPassword();
            this.checkDisabledPaymentButton();
        },
        password_confirmation: function (val) {
            this.validationConfirmPassword();
            this.checkDisabledPaymentButton();
        },
        code: function (val) {
            if (val.length > 0)
                this.validationCode();
        },
        notes: function (val) {
            this.checkDisabledPaymentButton();
            this.order.notes = val;
        }
    },
    computed: {
        numberOfScenarioWords: function () {
            let _numberOfWords = numberOfWords(this.scenario);
            this.order.number_of_scenario_words = _numberOfWords;
            return _numberOfWords;
        },
        numberOfMinutesScenario: function () {
            let _numberOfMinutes = numberOfMinutes(this.scenario);
            this.order.number_of_minutes_scenario = _numberOfMinutes;
            return _numberOfMinutes;
        },
        totalPricePerMinute: function () {
            let _totalPrice = scenarioPrice(this.scenario, this.voice.total_price)
            this.order.total_price_per_minute = parseFloat(_totalPrice.toFixed(2));
            return this.order.total_price_per_minute;
        },
        servicesPrice() {
            let totalValue = 0;
            let totalPercentage = 0;
            let _total = 0;

            if (this.services.length > 0) {
                let arrValue = [];
                let arrPercentage = [];
                let sumPercentage = 0;

                $.each(this.services, (index, service) => {
                    if (parseInt(service.type) === 1)   //type percentage= 1
                        arrPercentage.push(service.value);

                    if (parseInt(service.type) === 2)  //type value= 2
                        arrValue.push(service.value);
                });

                if (arrValue.length > 0) {
                    totalValue = sumArray(arrValue) * this.numberOfMinutesScenario;
                }

                if (arrPercentage.length > 0) {
                    sumPercentage = sumArray(arrPercentage);
                    totalPercentage = (calculateValueFromPercentage(this.voice.price_per_minute, sumPercentage)) * this.numberOfMinutesScenario;
                }

                _total = (totalValue + totalPercentage);

                this.order.services = {
                    list: this.services,
                    sub_total_value: totalValue,
                    sub_total_percentage: totalPercentage,
                    total: parseFloat(_total.toFixed(2)),
                };
            }else {
                this.order.services = {
                    list: [],
                    sub_total_value: 0,
                    sub_total_percentage: 0,
                    total: 0,
                };
            }

            return this.order.services.total;
        },
        subTotal: function () {
            let _subTotal = this.totalPricePerMinute + this.servicesPrice;
            this.order.sub_total = parseFloat(_subTotal.toFixed(2));
            return this.order.sub_total;
        },
        total: function () {
            let total = this.subTotal;
            if (this.coupon) {
                if (this.coupon.is_percent === 1) {
                    let valueDiscount = calculateValueFromPercentage(this.subTotal, this.coupon.value);
                    total = total - valueDiscount;
                    this.coupon.calculated_value = parseFloat(valueDiscount.toFixed(2));
                } else {
                    total = total - this.coupon.value;
                }
                this.order.coupon = this.coupon;
            }

            this.order.total = parseFloat(total.toFixed(2));
            return this.order.total;
        },
        totalCommission: function () { // fee payment methods
            let totalCommission = 0;
            if (this.commissions && this.commissions['stripe']) {
                let commissionStripe = parseFloat(this.commissions['stripe']);
                totalCommission = parseFloat((calculateValueFromPercentage(this.order.total, commissionStripe)).toFixed(2));
                this.order.payment_method.calculated_value = totalCommission;
                this.order.payment_method.value = commissionStripe;
            }

            return totalCommission;
        },
        totalToPaid: function () {
            this.order.totalToPaid = parseFloat((this.total + this.totalCommission).toFixed(2));
            return this.order.totalToPaid;
        },
    },
    mounted() {
        if (this.user) {
            this.full_name = this.user.full_name;
            this.email = this.user.email;
            this.order.full_name = this.user.full_name;
            this.order.email = this.user.email;
        }
        if (this.voice) {
            this.order.voice = this.voice;
        }

        //console.log('modal login:')
        //console.log(this.$refs.modalLoginForm)
    },
    methods: {
        validateBookingOrderRequest() {
            axios.post(this.$base_url + '/clients/booking/validate-booking-order-request', {
                scenario: this.scenario,
                notes: this.notes,
                order: this.order,
                whatsapp_number: this.whatsapp_number,
                services: this.services,
                coupon: this.coupon,
                do_not_account: this.do_not_account,
                full_name: this.full_name,
                email: this.email,
                password: this.password,
                password_confirmation: this.password_confirmation,
                voice: this.voice.id,
            }).then(response => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                $('#modal_payment').modal('show');
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                this.form.disabledPaymentButton = true;
                this.form.validation = error.response.data.errors;
                toastError(error);
            });
        },
        payment() {
            this.form.disabledButton = true;
            this.form.loadingDisplay = true;

            if (this.validationForm() === false) {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                return false;
            }

            this.validateBookingOrderRequest();
        },
        applyCoupon() {
            this.validationCode();

            if (this.form.validation && this.form.validation.code)
                return false;

            this.form.disabledButton = true;
            axios.post(this.$base_url + '/' + this.route + '/apply-coupon', {
                code: this.code,
                scenario: this.scenario,
            }).then(response => {
                this.coupon = response.data.data;
                this.form.disabledButton = false;
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.validation = error.response.data.errors;
                toastError(error);
            });
        },
        removeCoupon() {
            this.coupon = null;
            this.code = '';
            this.order.coupon = null;
        },
        setServices(event,service) {
            // let arr = [];
            // $.each(this.services, (index, service) => {
            //     arr.push(JSON.parse(service));
            // });
            // return arr;
            if (event.target.checked) {
                this.services.push(service);
            } else {
                this.services = this.services.filter(s => s.id !== service.id);
            }

           // this.services.push(service);
        },
        validationForm() {
            this.validationFullName();
            this.validationEmail();
            this.validationWhatsappNumber();
            this.validationScenario();
            if (this.do_not_account) {
                this.validationPassword();
                this.validationConfirmPassword();
            }
            if (this.form.validation && Object.keys(this.form.validation).length > 0) {
                this.form.disabledPaymentButton = true;
                return false;
            }
            this.form.validation = null;
            return true;
        },
        validationCode() {
            if (this.code === '') {
                if (this.form.validation === null) {
                    this.form.validation = {code: [this.$t('code_is_required')]};
                } else {
                    Object.assign(this.form.validation, {code: [this.$t('code_is_required')]});
                }
            } else {
                if (this.form.validation && this.form.validation.code) {
                    Vue.delete(this.form.validation, 'code');
                }
            }
        },
        validationFullName() {
            if (this.full_name === '') {
                if (this.form.validation === null) {
                    this.form.validation = {full_name: [this.$t('full_name_is_required')]};
                } else {
                    Object.assign(this.form.validation, {full_name: [this.$t('full_name_is_required')]});
                }
            } else {
                if (this.form.validation && this.form.validation.full_name) {
                    Vue.delete(this.form.validation, 'full_name');
                }
                this.order.full_name = this.full_name;
            }
        },
        validationEmail() {
            if (this.email === '') {
                if (this.form.validation === null) {
                    this.form.validation = {email: [this.$t('email_is_required')]};
                } else {
                    Object.assign(this.form.validation, {email: [this.$t('email_is_required')]});
                }
            } else {
                if (isValidEmail(this.email) === false) {
                    if (this.form.validation === null) {
                        this.form.validation = {email: [this.$t('please_enter_a_valid_email_address')]};
                    } else {
                        Object.assign(this.form.validation, {email: [this.$t('please_enter_a_valid_email_address')]});
                    }
                } else {
                    if (this.form.validation && this.form.validation.email) {
                        Vue.delete(this.form.validation, 'email');
                    }
                    this.order.email = this.email;
                }
            }
        },
        validationPassword() {
            if (this.password === '') {
                if (this.form.validation === null) {
                    this.form.validation = {password: [this.$t('password_is_required')]};
                } else {
                    Object.assign(this.form.validation, {password: [this.$t('password_is_required')]});
                }
            } else {
                if (this.form.validation && this.form.validation.password) {
                    Vue.delete(this.form.validation, 'password');
                }
                this.order.password = this.password;
            }
            this.validationDoNotAccount();
        },
        validationDoNotAccount() {
            if (this.password !== '' && this.password_confirmation !== '') {
                if (this.form.validation && this.form.validation.do_not_account)
                    Vue.delete(this.form.validation, 'do_not_account');
            }
        },
        validationConfirmPassword() {
            if (this.password_confirmation === '') {
                if (this.form.validation === null) {
                    this.form.validation = {password_confirmation: [this.$t('password_confirmation_is_required')]};
                } else {
                    Object.assign(this.form.validation, {password_confirmation: [this.$t('password_confirmation_is_required')]});
                }
            } else {
                if (this.form.validation && this.form.validation.password_confirmation) {
                    Vue.delete(this.form.validation, 'password_confirmation');
                    this.order.password_confirmation = this.password_confirmation;
                }
            }
            this.validationDoNotAccount();
        },
        validationWhatsappNumber() {
            if (this.whatsapp_number === '') {
                if (this.form.validation === null) {
                    this.form.validation = {whatsapp_number: [this.$t('whatsapp_number_is_required')]};
                } else {
                    Object.assign(this.form.validation, {whatsapp_number: [this.$t('whatsapp_number_is_required')]});
                }
            } else {
                if (this.form.validation && this.form.validation.whatsapp_number) {
                    Vue.delete(this.form.validation, 'whatsapp_number');
                }
                this.order.whatsapp_number = this.whatsapp_number;
            }
        },
        validationScenario() {
            if (this.scenario === '') {
                if (this.form.validation === null) {
                    this.form.validation = {scenario: [this.$t('scenario_is_required')]};
                } else {
                    Object.assign(this.form.validation, {scenario: [this.$t('scenario_is_required')]});
                }
            } else {
                if (this.form.validation && this.form.validation.scenario) {
                    Vue.delete(this.form.validation, 'scenario');
                }
                this.order.scenario = this.scenario;
            }
        },
        checkDisabledPaymentButton() {
            if (this.full_name !== '' && this.email !== '' && this.whatsapp_number !== '' && this.scenario !== '') {
                this.form.disabledPaymentButton = (this.do_not_account && (this.password === '' || this.password_confirmation === '')) || isValidEmail(this.email) === false;
                this.order.do_not_account = this.do_not_account;
            } else {
                this.form.disabledPaymentButton = true;
            }
        },
        checkApprovalPayment() {

        }
    }
});

