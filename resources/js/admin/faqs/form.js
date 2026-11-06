Vue.component('faq-form', {
    data() {
        return {
            route: 'faqs',
            id: null,
            title: languages(),
            details: languages(),
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },
    props: ['faq'],
    mounted() {
        if (this.faq) {
            this.id = this.faq.id
            this.title = this.faq.title
            this.details = this.faq.details
        }
    },
    methods: {
        save() {
            this.form.disabledButton = true;
            this.form.validation = null;
            showLoading();
            axios.post(this.$admin_url + '/' + this.route + '/store', {
                id: this.id,
                title: this.title,
                details: this.details,
            }).then(response => {
                hideLoading();
                this.form.disabledButton = false;
                swalSuccess(response.data.message);
                adminRedirectTo(this.route);
            }).catch(error => {
                hideLoading();
                this.form.disabledButton = false;
                this.form.validation = error.response.data.errors;
                swalError(error);
            })
        },
    }
});
