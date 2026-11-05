Vue.component('guide-form', {
    data() {
        return {
            route: 'guides',
            id: null,
            name: languages(),
            details: languages(),
            type: 1,
            price: 0.0,
            image: null,
            file: null,
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },
    props: ['guide'],
    mounted() {
        if (this.guide) {
            this.id = this.guide.id
            this.name = this.guide.name
            this.details = this.guide.details
            this.image = this.guide.image
            this.file = this.guide.file
            this.price = this.guide.price
            this.type = this.guide.type
        }
    },
    methods: {
        setFile() {
            return this.file && this.file.file_link ? this.file.file_link : (this.file && this.file.url ? this.file.name : this.file);
        },
        setImage() {
            return this.image && this.image.file_link ? this.image.file_link : (this.image && this.image.url ? this.image.name : this.image);
        },
        save() {
            this.form.disabledButton = true;
            this.form.validation = null;
            showLoading();
            axios.post(this.$admin_url + '/' + this.route + '/store', {
                id: this.id,
                name: this.name,
                details: this.details,
                price: this.price,
                type: this.type,
                image: this.setImage(),
                file: this.setFile(),
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
