Vue.component('login-by-services-form', {
    data() {
        return {
            type: '',
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            }
        }
    },
    props: {
        redirectUrl: null,
    },
    mounted() {
    },
    methods: {
        doLoginByGoogle(route) {
            this.form.disabledButton = true;
            this.form.loadingDisplay = true;

            if (this.validationType() === false) {
                toastError(this.$t('type_is_required'));

                this.form.disabledButton = false;
                this.form.loadingDisplay = false;

                return false;
            }
            this.form.validation = null;
            this.form.disabledButton = false;
            window.location.href = route;
        },
        validationType() {
            if (this.type === '') {
                if (this.form.validation === null) {
                    this.form.validation = {type: [this.$t('type_is_required')]};
                } else {
                    Object.assign(this.form.validation, {type: [this.$t('type_is_required')]});
                }
                return false;
            }
            return true;
        },
        eventSetType() {
            $(".step-box-content").removeClass("active");
            $('#login_google_' + this.type).addClass('active');
        }
    }
});

