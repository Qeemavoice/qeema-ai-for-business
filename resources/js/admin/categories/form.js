Vue.component('category-form', {
    data() {
        return {
            route: 'categories',
            id: null,
            name: languages(),
            fontawesome_icon: '',
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },
    props: ['category'],
    mounted() {
        if (this.category) {
            this.id = this.category.id
            this.name = this.category.name
            this.fontawesome_icon = this.category.fontawesome_icon
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
                fontawesome_icon: this.fontawesome_icon,
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
