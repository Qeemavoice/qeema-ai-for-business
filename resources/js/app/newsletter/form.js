Vue.component('newsletter-form', {
    data() {
        return {
            route: 'newsletter',
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
            this.form.disabledButton = true;
            this.form.loadingDisplay = true;
            this.form.validation = null;
            axios.post(this.$base_url + '/' + this.route + '/subscribe', {
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
            this.email = '';
            this.form.loadingDisplay = false;
            this.form.disabledButton = false;
            this.form.validation = null;
        }
    }
});

