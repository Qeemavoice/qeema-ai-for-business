Vue.component('partner-form', {
    data() {
        return {
            route: 'partners',
            id: null,
            full_name: languages(),
            job_title: languages(),
            description: languages(),
            alt: languages(),
            image: null,
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },
    props: ['partner'],
    mounted() {
        if (this.partner) {
            this.id = this.partner.id
            this.full_name = this.partner.full_name
            this.job_title = this.partner.job_title
            this.description = this.partner.description
            this.alt = this.partner.alt
            this.image = this.partner.image
        }
    },
    methods: {
        save() {
            this.form.disabledButton = true;
            this.form.validation = null;
            showLoading();
            axios.post(this.$admin_url + '/' + this.route + '/store', {
                id: this.id,
                full_name: this.full_name,
                job_title: this.job_title,
                description: this.description,
                alt: this.alt,
                image: this.image && this.image.file_link ? this.image.file_link : this.image,
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
