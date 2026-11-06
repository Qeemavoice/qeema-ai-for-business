Vue.component('general-logo', {
    data() {
        return {
            route: 'settings',
            key: 'general_setting_logo',
            header_logo: null,
            favicon: null,
            alt_header_logo: languages(),
            alt_favicon: languages(),
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },

    props: ['general_logo'],

    watch: {
        general_logo: function (v) {
            if (v) {
                this.header_logo = {
                    name: v.header_logo,
                    url: v.header_logo_url,
                }
                this.favicon = {
                    name: v.favicon,
                    url: v.favicon_url
                }

                this.alt_favicon = v.alt_favicon ? v.alt_favicon : languages();
                this.alt_header_logo = v.alt_header_logo ? v.alt_header_logo : languages();
            }
        }
    },
    methods: {
        save() {
            this.form.disabledButton = true;
            this.form.validation = null;
            axios.post(this.$admin_url + '/' + this.route + '/store', {
                header_logo: this.setLogo(),
                alt_header_logo: this.alt_header_logo,
                alt_favicon: this.alt_favicon,
                favicon: this.setFavicon(),
            }).then(response => {
                this.reset();
                swalSuccess(response.data.message);
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.validation = error.response.data.errors;
            })
        },
        setLogo() {
            return this.header_logo && this.header_logo.file_link ? this.header_logo.file_link : (this.header_logo &&this.header_logo.name ? this.header_logo.name : this.header_logo);
        },
        setFavicon() {
            return this.favicon && this.favicon.file_link ? this.favicon.file_link : (this.favicon && this.favicon.url ? this.favicon.name : this.favicon);
        },
        reset() {
            this.form.disabledButton = false;
            this.form.validation = null;
        }
    },

});
