Vue.component('admin-login', {
    data() {
        return {
            email: '',
            password: '',
            remember: false,
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            }
        }
    },
    methods: {
        login() {
            this.form.disabledButton = true;
            // showLoading();
            this.form.validation = null;
            axios.post(BASE_URL  + '/old-admin/auth', {
                email: this.email,
                password: this.password,
                remember: this.remember,
            }).then(response => {
                // swalSuccess(this.$t('success'));
                window.location.href = response.data.data.redirectTo;
            }).catch(error => {
                // hideLoading();
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                this.form.validation = error.response.data.errors;
            })
        }
    }
});

