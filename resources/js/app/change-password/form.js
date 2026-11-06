Vue.component('change-password-form', {
    data() {
        return {
            current_password: '',
            new_password: '',
            confirm_new_password: '',
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            }
        }
    },
    methods: {
        update() {
            this.form.disabledButton = true;
            this.form.validation = null;
            showLoading();
            axios.post(this.$admin_url  + '/change-password/store', {
                current_password: this.current_password,
                new_password: this.new_password,
                confirm_new_password: this.confirm_new_password,
            }).then(response => {
                this.form.disabledButton = false;
                swalSuccess(response.data.message);
            }).catch(error => {
               // console.log(error.response)
                hideLoading();
                this.form.disabledButton = false;
                this.form.validation = error.response.data.errors;
                swalError(error);
            })
        }
    }
});

