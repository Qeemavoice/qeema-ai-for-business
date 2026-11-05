Vue.component('language-form', {
    data() {
        return {
            route: 'languages',
            id: null,
            name: languages(),
            code: '',
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },
    props: ['language'],
    mounted() {
        if (this.language) {
            this.id = this.language.id
            this.name = this.language.name
            this.code = this.language.code
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
                code: this.code,
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
