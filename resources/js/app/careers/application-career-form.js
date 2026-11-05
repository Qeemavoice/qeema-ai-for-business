Vue.component('application-career-form', {
    data() {
        return {
            route: 'careers',
            name: '',
            email: '',
            whatsapp: '',
            career_id: null,
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            }
        }
    },
    props: ['career'],
    mounted() {
        //console.log(this.$base_url)
        if (this.career) {
            this.career_id = this.career.id;
        }
    },
    methods: {
        applyJob() {
            this.form.loadingDisplay = true;
            this.form.disabledButton = true;
            this.form.validation = null;
            axios.post(this.$base_url + '/' + this.route + '/job-applications/apply', {
                name: this.name,
                email: this.email,
                whatsapp: this.whatsapp,
                career_id: this.career_id,
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
            this.whatsapp = '';
            this.form.loadingDisplay = false;
            this.form.disabledButton = false;
            this.form.validation = null;
        }
    }
});

