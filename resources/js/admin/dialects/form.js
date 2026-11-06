Vue.component('dialect-form', {
    data() {
        return {
            route: 'dialects',
            id: null,
            name: languages(),
            language: '',
            languages: [],
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },
    props: ['dialect'],
    mounted() {

        this.getLanguages();

        if (this.dialect) {
            this.id = this.dialect.id
            this.name = this.dialect.name
            this.language = this.dialect.language_id
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
                language: this.language,
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
        getLanguages() {
            axios.get(this.$admin_url + '/languages/all',).then(response => {
                this.languages = response.data.data;
            }).catch(error => {
                swalError(error);
            })
        },
    }
});
