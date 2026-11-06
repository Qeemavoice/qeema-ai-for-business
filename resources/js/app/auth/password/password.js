Vue.component('reset-password-form', {
    data() {
        return {
            password: '',
            password_confirmation: '',
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            }
        }
    },
    props: ['token'],
    methods: {
        send() {
            this.form.disabledButton = true;
            this.form.loadingDisplay = true;
            this.form.validation = null;
            axios.post(BASE_URL  + '/password/reset', {
                password: this.password,
                password_confirmation: this.password_confirmation,
                token: this.token,
            }).then(response => {
                toastSuccess();
                this.resetForm();
                $('#modal_login').modal('show');
                $('#modal_rest_password').modal('hide');
                //window.location.href = response.data.data.redirectTo;
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                this.form.validation = error.response.data.errors;
                toastError(error);
            })
        },
        resetForm() {
            this.password = '';
            this.password_confirmation = '';
            this.form.validation = null;
            this.form.disabledButton = false;
            this.form.loadingDisplay = false;
        }
    }
});

