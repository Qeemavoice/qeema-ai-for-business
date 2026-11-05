Vue.component('setting-section-home-page', {
    data() {
        return {
            route: 'settings',
            key: 'home_page_setting_section',
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
    props: ['home_page_setting_section'],
    watch:{
        home_page_welcome_section:function (val) {
            if (val) {
                this.value.title = val.title;
                this.value.short_description = val.short_description;
                this.value.video_url = val.video_url;
                this.value.image = {
                    name : val.image.name,
                    url : val.image.url,
                };
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
                value: this.value,
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
        }
    }
});
