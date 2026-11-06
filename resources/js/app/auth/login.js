Vue.component('login-form', {
//    inject: ['_email','_redirectUrl'],
    data() {
        return {
            email: '',
            password: '',
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
        $('#modal_login').on('hidden.bs.modal', (e) => {
            this.resetForm();
        });
    },
    methods: {
        showForgetPasswordForm() {
            $("#modal_login").modal("hide");
            $("#modal_forget_password").modal("show");
        },
        doLogin() {
            this.form.loadingDisplay = true;
            this.form.disabledButton = true;
            this.form.validation = null;
            axios.post(BASE_URL + '/login', {
                email: this.email,
                password: this.password,
                redirectUrl: this.redirectUrl,
            }).then(response => {
                toastSuccess();

                let redirectTo = localStorage.getItem('redirectTo');

                if (redirectTo) {
                    localStorage.removeItem('redirectTo');
                    window.location.href = redirectTo;
                } else {
                    window.location.href = response.data.data.redirectTo;
                }
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                this.form.validation = error.response.data.errors;
                toastError(error);
            })
        },
        showRegisterForm() {
            $("#modal_login").modal("hide");
            $("#modal_registration").modal("show");
        },
        showLoginGoogleModal() {
            $("#modal_login").modal("hide");
            $("#modal_login_google").modal("show");
        },
        resetForm() {
            this.email = '';
            this.password = '';
            this.form.disabledButton = false;
            this.form.loadingDisplay = false;
            this.form.validation = null;
        },
        eventSetType() {
            $(".step-box-content").removeClass("active");
            $('#login_google_' + this.type).addClass('active');
        },

    }
});

