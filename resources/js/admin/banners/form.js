Vue.component('banner-form', {
    data() {
        return {
            route: 'banners',
            id: null,
            title: languages(),
            description: languages(),
            page: '',
            is_active: false,
            position: '',
            call_to_action_url: '',
            image: null,
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            },
        }
    },
    props: {
        banner: null,
    },
    mounted() {

        if (this.banner) {
            this.id = this.banner.id;
            this.title = this.banner.title;
            this.description = this.banner.description;
            this.page = this.banner.page;
            this.position = this.banner.position;
            this.image = {
                name:  this.banner.image,
                url:  this.banner.image_url,
            };
            this.is_active = this.banner.is_active;
            this.call_to_action_url = this.banner.call_to_action_url;
        }
    },
    methods: {
        save() {
            this.form.disabledButton = true;
            this.form.loadingDisplay = true;
            this.form.validation = null;
            axios.post(ADMIN_URL + '/' + this.route + '/store', {
                id: this.id,
                image: this.handlerImageLang(),
                title: this.title,
                description: this.description,
                page: this.page,
                position: this.position,
                is_active: this.is_active,
                call_to_action_url: this.call_to_action_url,
            }).then(response => {
                hideLoading();
                this.form.disabledButton = false;
                swalSuccess(response.data.message);
                adminRedirectTo(this.route);
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                this.form.validation = error.response.data.errors;
                swalError(error);
            })
        },
        handlerImageLang() {
            return (this.image && this.image.file_link) ? this.image.file_link : ((this.image && this.image.name) ? this.image.name :this.image);
        },
    }
});

