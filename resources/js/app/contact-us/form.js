Vue.component('contact-us-form', {
    data() {
        return {
            name: '',
            mobile: '',
            message: '',
            email: '',
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            }
        }
    },
    methods: {
        save() {
            this.form.loadingDisplay = true;
            this.form.disabledButton = true;
            this.form.validation = null;
            axios.post(this.$base_url  + '/contact-us/store', {
                name: this.name,
                mobile: this.mobile,
                message: this.message,
                email: this.email,
            }).then(response => {
                toastSuccess();
                this.resetForm();
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                this.form.validation = error.response.data.errors;
                toastError(error);
            })
        },
        resetForm() {
            this.name = '';
            this.email = '';
            this.mobile = '';
            this.message = '';
            this.form.loadingDisplay = false;
            this.form.disabledButton = false;
            this.form.validation = null;
        }
    }
});

