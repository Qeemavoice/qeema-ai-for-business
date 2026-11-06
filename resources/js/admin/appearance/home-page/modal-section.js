Vue.component('modal-section-home-page', {
    data() {
        return {
            route: 'settings',
            key: 'home_page_modal_section',
            value: {
                title: languages(),
                short_description: languages(),
                sub_title: languages(),
                file: null,
                is_show: false,
            },
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },
    props: ['home_page_modal_section'],
    watch: {
        home_page_modal_section: function (val) {
            if (val) {
                this.value.title = val.title;
                this.value.short_description = val.short_description;
                this.value.sub_title = val.sub_title;
                this.value.is_show = val.is_show;
                this.value.file = val.file;
            }
        },
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
                file: this.setFile(this.value.file),
                is_show: this.value.is_show,
                short_description: this.value.short_description,
                sub_title: this.value.sub_title,
                title: this.value.title,
            }
        },
        setFile(file) {
           return  {
                file_link: file.file ? file.file.file_link : file.file_link,
                previous_name: file.file ? file.file.previous_name : file.name,
                size: file.file ? file.file.size : file.size,
                mime_type: file.file ? file.file.mime_type : file.mimeType,
            };
        }
    }
});
