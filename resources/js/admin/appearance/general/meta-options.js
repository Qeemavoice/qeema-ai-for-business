Vue.component('general-meta-options', {
    data() {
        return {
            route: 'settings',
            key: 'general_meta_options',
            meta_title: languages(),
            meta_keyword: languages(),
            meta_description: languages(),
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },
    props: {
        general: null,
    },
    watch: {
        general: function (v) {
            if (v) {
                if (v.meta_title)
                    this.meta_title = v.meta_title

                if (v.meta_keyword)
                    this.meta_keyword = v.meta_keyword

                if (v.meta_description)
                    this.meta_description = v.meta_description
            }
        }
    },
    mounted() {
    },
    methods: {
        save() {
            this.form.disabledButton = true;
            this.form.validation = null;
            showLoading();
            axios.post(this.$admin_url + '/' + this.route + '/store', {
                key: this.key,
                meta_title: this.meta_title,
                meta_keyword: this.meta_keyword,
                meta_description: this.meta_description,
            }).then(response => {
                this.reset();
                swalSuccess(response.data.message);
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.validation = error.response.data.errors;
            })
        },
        reset() {
            this.form.disabledButton = false;
            this.form.validation = null;
        }
    }
});
