Vue.component('permission-form', {
    data() {
        return {
            route: 'permissions',
            id: null,
            show_name: languages(),
            unique_name: '',
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },
    props: ['permission'],
    mounted() {
        if (this.permission) {
            this.id = this.permission.id
            this.show_name = this.permission.show_name
            this.unique_name = this.permission.name
        }
    },
    methods: {
        save() {
            this.form.disabledButton = true;
            this.form.validation = null;
            showLoading();
            axios.post(this.$admin_url + '/' + this.route + '/store', {
                id: this.id,
                show_name: this.show_name,
                unique_name: this.unique_name,
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
