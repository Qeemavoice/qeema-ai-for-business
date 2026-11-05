Vue.component('coupon-form', {
    data() {
        return {
            route: 'coupons',
            id: null,
            name: languages(),
            is_active: false,
            code: null,
            value: null,
            minimum_minutes: null,
            usage_limit_per_coupon: null,
            usage_limit_per_customer: null,
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },
    props: {
        coupon: null,
    },
    mounted() {

        if (this.coupon) {
            this.id = this.coupon.id;
            this.name = this.coupon.name;
            this.code = this.coupon.code;
            this.value = this.coupon.value;
            this.minimum_minutes = this.coupon.minimum_minutes;
            this.usage_limit_per_coupon = this.coupon.usage_limit_per_coupon;
            this.usage_limit_per_customer = this.coupon.usage_limit_per_customer;
            this.is_active = this.coupon.is_active;
        }
    },
    methods: {
        save() {
            this.form.disabledButton = true;
            this.form.loadingDisplay = true;
            this.form.validation = null;
            axios.post(this.$admin_url + '/' + this.route + '/store', {
                id: this.id,
                is_active: this.is_active,
                minimum_minutes: this.minimum_minutes,
                name: this.name,
                code: this.code,
                value: this.value,
                usage_limit_per_coupon: this.usage_limit_per_coupon,
                usage_limit_per_customer: this.usage_limit_per_customer,
            }).then(response => {
                hideLoading();
                this.form.disabledButton = false;
                swalSuccess(response.data.message);
                adminRedirectTo(this.route);
                swalSuccess(response.data.message);
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                this.form.validation = error.response.data.errors;
                swalError(error);
            })
        },

    }
});
