Vue.component('general-footer', {
    data() {
        return {
            route: 'settings',
            key: 'general_footer',
            footer_about_site: languages(),
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },

    props: ['general_footer'],

    watch: {
        general_footer: function (v) {
            if (v) {
                if (v.footer_about_site)
                    this.footer_about_site = v.footer_about_site
            }
        }
    },

    methods: {
        save() {
            this.form.disabledButton = true;
            this.form.validation = null;
            axios.post(ADMIN_URL + '/' + this.route + '/store', {
                key: this.key,
                footer_about_site: this.footer_about_site,
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
