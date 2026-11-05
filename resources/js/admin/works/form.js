Vue.component('work-form', {
    data() {
        return {
            route: 'works',
            id: null,
            title: languages(),
            url: null,
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },
    props: ['work'],
    mounted() {
        if (this.work) {
            this.id = this.work.id
            this.title = this.work.title
            this.url = this.work.url
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
                url: this.url,
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
