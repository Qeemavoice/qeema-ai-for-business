Vue.component('customer-form', {
    data() {
        return {
            route: 'customers',
            id: null,
            name: languages(),
            alt: languages(),
            image: null,
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },
    props: ['customer'],
    mounted() {
        if (this.customer) {
            this.id = this.customer.id
            this.name = this.customer.name
            this.alt = this.customer.alt
            this.image = {
                name: this.customer.image,
                url: this.customer.image_url,
            }
        }
    },
    methods: {
        save() {
            this.form.disabledButton = true;
            this.form.validation = null;
            showLoading();
            axios.post(this.$admin_url + '/' + this.route + '/store', {
                id: this.id,
                name: this.name,
                alt: this.alt,
                image: this.getImage(),
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
        getImage() {
           return  this.image && this.image.file_link ? this.image.file_link  : this.image && this.image.name ? this.image.name :this.image
        },
    }
});
