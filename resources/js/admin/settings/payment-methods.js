Vue.component('setting-payment-methods-index', {
    data() {
        return {
            route: 'settings/payment-methods',
            cash: {
                name: languages(),
                description: languages(),
                is_active: false,
            },
            stripe: {
                name: languages(),
                description: languages(),
                config: {
                    key_id: null,
                    secret: null,
                },
                sandbox_is_active: false,
                sandbox_config: {
                    key_id: null,
                    secret: null,
                },
                is_active: false,
            },
            paypal: {
                name: languages(),
                description: languages(),
                config: {
                    client_id: null,
                    secret: null,
                },
                sandbox_is_active: false,
                sandbox_config: {
                    client_id: null,
                    secret: null,
                },
                is_active: false,
            },
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            },
            tab: 1,
        }
    },
    props: {
        paymentMethods: null,
        page: null,
    },
    watch: {
        // "stripe.sandbox_is_active": function (val) {
        //     if(val === false)
        //         this.stripe.is_active = false;
        // }
    },
    mounted() {
        if (this.paymentMethods) {
            this.paymentMethods.forEach((obj, index) => {
                if (obj.id === PAYPAL) {
                    this.paypal.name = obj.name;
                    this.paypal.description = obj.description ? obj.description : languages();
                    this.paypal.config = obj.config ? obj.config : {client_id: null, secret: null};
                    this.paypal.sandbox_is_active = !!obj.sandbox_config;

                    if (obj.sandbox_config)
                        this.paypal.sandbox_config = obj.sandbox_config;

                    this.paypal.is_active = obj.is_active;
                }
                if (obj.id === STRIPE) {
                    this.stripe.name = obj.name;
                    this.stripe.description = obj.description ? obj.description : languages();
                    this.stripe.config = obj.config ? obj.config : {key_id: null, secret: null};
                    this.stripe.sandbox_is_active = !!obj.sandbox_config;
                    if (obj.sandbox_config)
                        this.stripe.sandbox_config = obj.sandbox_config;
                    this.stripe.is_active = obj.is_active;
                }

                if (obj.id === CASH) {
                    this.cash.name = obj.name;
                    this.cash.description = obj.description ? obj.description : languages();
                    this.cash.is_active = obj.is_active;
                }
            });
        }
    },
    methods: {
        onTab(tab) {
            this.tab = tab;
        },
        save() {
            showLoading();
            this.form.disabledButton = true;
            this.form.loadingDisplay = true;
            this.form.validation = null;
            axios.post(ADMIN_URL + '/' + this.route + '/store', {
                stripe: this.stripe,
                paypal: this.paypal,
                cash: this.cash,
                page: this.page,
                tab: this.tab,
            }).then(response => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                swalSuccess(response.data.message);
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                this.form.validation = error.response.data.errors;
                swalError(error);
            })
        },
        reset() {
            let cureent_url = window.location.href;
            let split_url = cureent_url.split('#');

            if (split_url.length === 1 || split_url[1] === 'paypal') {
                this.paypal = {
                    name: languages(),
                    description: languages(),
                    config: {
                        client_id: null,
                        secret: null,
                    },
                    sandbox_is_active: false,
                    sandbox_config: {
                        client_id: null,
                        secret: null,
                    },
                    is_active: false,
                };
            }

            if (split_url[1] === 'stripe') {
                this.stripe = {
                    name: languages(),
                    description: languages(),
                    config: {
                        key_id: null,
                        secret: null,
                    },
                    sandbox_is_active: false,
                    sandbox_config: {
                        key_id: null,
                        secret: null,
                    },
                    is_active: false,
                };
            }
            if (split_url[1] === 'cache') {
                this.cache = {
                    name: languages(),
                    description: languages(),
                    is_active: false,
                };
            }
        }
    }
});

