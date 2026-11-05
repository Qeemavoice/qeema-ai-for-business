Vue.component('rating-group-form', {
    data() {
        return {
            route: 'rating-groups',
            id: null,
            name: languages(),
            is_active: false,
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            }
        }
    },
    mounted() {
        if (this.group) {
            this.id = this.group.id;
            this.name = this.group.name;
            this.is_active = this.group.is_active;
        }
    },
    props: {
        group: null,
    },
    watch: {},
    methods: {
        save() {
            this.form.disabledButton = true;
            this.form.validation = null;
            showLoading();
            axios.post(this.$admin_url + '/' + this.route + '/store', {
                id: this.id,
                name: this.name,
                is_active: this.is_active,
            }).then(response => {
                hideLoading();
                this.form.disabledButton = false;
                swalSuccess(response.data.message);
                adminRedirectTo(this.route);
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                this.form.validation = error.response.data.errors;
                swalError(error);
            })
        },

    }
});

