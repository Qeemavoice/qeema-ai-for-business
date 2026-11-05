Vue.component('rating-criteria-form', {
    data() {
        return {
            route: 'rating-criterias',
            id: null,
            name: languages(),
            group_id: '',
            groups: [],
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
                loadingGroupList: false,
            }
        }
    },
    props: {
        criteria: null,
    },
    mounted() {
        if (this.criteria) {
            this.id = this.criteria.id;
            this.name = this.criteria.name;
            this.group_id = this.criteria.group;
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
                group: this.group_id
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
            });
        },
        reset() {
            this.name = languages();
            this.form.validation = null;
        },
        getGroup(query) {
            if (query !== '' && query.length >= 3) {
                this.form.loadingVoicesList = true;
                axios.get(this.$admin_url + '/rating-groups/search', {
                    params: {
                        query: query
                    }
                }).then(response => {
                    this.form.loadingVoicesList = false;
                    this.groups = response.data.data.data;
                }).catch(error => {
                    this.form.loadingVoicesList = false;
                    swalError(error);
                })
            }
        }
    }
});
