Vue.component('forget-password-form', {
    data() {
        return {
            email: '',
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            }
        }
    },
    methods: {
        send() {
            this.form.loadingDisplay = true;
            this.form.disabledButton = true;
            this.form.validation = null;
            axios.post(BASE_URL  + '/password/email', {
                email: this.email,
            }).then(response => {
                this.resetForm();
                $('#modal_forget_password').modal('hide');
                toastSuccess();
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                this.form.validation = error.response.data.errors;
                toastError(error);
            })
        },
        showLoginForm() {
            $("#modal_login").modal("show");
            $("#modal_forget_password").modal("hide");
        },
        resetForm() {
            this.email = '';
            this.form.disabledButton = false;
            this.form.loadingDisplay = false;
            this.form.validation = null;
        },
    }
});

