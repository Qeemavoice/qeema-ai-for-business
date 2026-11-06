Vue.component('service-form', {
    data() {
        return {
            route: 'services',
            id: null,
            title: languages(),
            value: '',
            type: '',
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },
    props: ['service'],
    mounted() {
        if (this.service) {
            this.id = this.service.id
            this.title = this.service.title
            this.value = this.service.value
            this.type = this.service.type
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
                value: this.value,
                type: this.type,
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
