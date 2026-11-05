Vue.component('general-social-media-links', {
    data() {
        return {
            route: 'settings',
            key: 'general_setting_social_media_links',
            facebook: '',
            youtube: '',
            tiktok: '',
            linkedin: '',
            instagram: '',
            twitter: '',
            whatsapp: '',
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },
    props: {
        general_social_media_links: null,
    },
    watch: {
        general_social_media_links: function (v) {
            if (v) {
                this.facebook = v.facebook;
                this.youtube = v.youtube;
                this.tiktok = v.tiktok;
                this.linkedin = v.linkedin;
                this.instagram = v.instagram;
                this.whatsapp = v.whatsapp;
                this.twitter = v.twitter;
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
                facebook: this.facebook,
                youtube: this.youtube,
                tiktok: this.tiktok,
                linkedin: this.linkedin,
                instagram: this.instagram,
                whatsapp: this.whatsapp,
                twitter: this.twitter,
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
