Vue.component('booking-step-form', {
    data() {
        return {
            route: 'booking-steps',
            id: null,
            title: languages(),
            alt: languages(),
            image: null,
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },
    props: ['step'],
    mounted() {
        if (this.step) {
            this.id = this.step.id
            this.title = this.step.title
            this.alt = this.step&&this.step.alt ? this.step.alt : languages();
            this.image = {
                name:  this.step.image,
                url:  this.step.image_url,
            };
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
                alt: this.alt,
                image: this.handlerImageLang(),
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
        handlerImageLang() {
            return (this.image && this.image.file_link) ? this.image.file_link : ((this.image && this.image.name) ? this.image.name : this.image);
        },
    }
});
