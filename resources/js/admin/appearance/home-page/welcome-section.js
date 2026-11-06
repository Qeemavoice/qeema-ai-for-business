Vue.component('welcome-section-home-page', {
    data() {
        return {
            route: 'settings',
            key: 'home_page_welcome_section',
            value: {
                title: languages(),
                short_description: languages(),
                image: null,
                video_url: null,
            },
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },
    props: ['home_page_welcome_section'],
    watch: {
        home_page_welcome_section: function (val) {
            if (val) {
                this.value.title = val.title;
                this.value.short_description = val.short_description;
                this.value.video_url = val.video_url;
                this.value.image = val.image;
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
                image: this.setFile(this.value.image),
                video_url: this.value.video_url,
                title: this.value.title,
                short_description: this.value.short_description,
            }
        },
        setFile(image) {
            if (image) {
                return {
                    file_link: image.image ? image.image.file_link : image.file_link,
                    previous_name: image.image ? image.image.previous_name : image.name,
                    size: image.image ? image.image.size : image.size,
                    mime_type: image.image ? image.image.mime_type : image.mimeType,
                };
            }

        }
    }
});
