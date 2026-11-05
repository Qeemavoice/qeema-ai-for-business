Vue.component('voices-page', {
    data() {
        return {
            route: 'settings',
            ADMIN_URL: ADMIN_URL,
            key: 'voices_page',
            value: {
                background: null,
            },
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },
    props: ['settings'],
    watch: {
    },
    mounted() {
        _.each(this.settings, setting => {
            switch (setting.key) {
                case 'voices_page':
                    this.value = setting.value_decoded;
                    break;
            }
        });
    },
    methods: {
        save() {
            this.form.disabledButton = true;
            this.form.validation = null;
            showLoading();
            axios.post(this.$admin_url + '/' + this.route + '/store', {
                key: this.key,
                value: this.setValue(),
            }).then(response => {
                this.reset();
                swalSuccess(response.data.message);
                hideLoading();
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.validation = error.response.data.errors;
                hideLoading();
            })
        },
        reset() {
            this.form.disabledButton = false;
            this.form.validation = null;
        },
        setValue() {
            return {
                background: this.setFile(this.value.background),
            }
        },
        setFile(image) {
            if (image) {
                return {
                    file_link: image.background ? image.background.file_link : image.file_link,
                    previous_name: image.background ? image.background.previous_name : image.name,
                    size: image.background ? image.background.size : image.size,
                    mime_type: image.background ? image.background.mime_type : image.mimeType,
                };
            }
        }
    }
});
