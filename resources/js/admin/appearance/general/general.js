Vue.component('general-setting', {
    data() {
        return {
            route: 'settings',
            key: 'general_setting',
            website_name: languages(),
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

                if (this.website_name)
                    this.website_name = v.website_name

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
                website_name: this.website_name,
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
