Vue.component('article-form', {
    data() {
        return {
            route: 'articles',
            id: null,
            video_url: null,
            title: languages(),
            short_description: languages(),
            content: languages(),
            meta_keywords: languages(),
            meta_description: languages(),
            internal_image: null,
            external_image: null,
            status: '',
            form: {
                validation: null,
                disabledButton: false,
            },
            LANGUAGES: JSON.parse(LANGUAGES),
        }
    },
    props: ['article'],
    mounted() {
        if (this.article) {
            this.id = this.article.id
            this.title = this.article.title
            this.short_description = this.article.short_description
            this.content = this.article.content
            this.meta_keywords = this.article.meta_keywords
            this.meta_description = this.article.meta_description
            this.video_url = this.article.video_url
            this.status = this.article.status

            if (this.article.external_image) {
                this.external_image = {
                    name: this.article.external_image,
                    url: this.article.external_image_url,
                }
            }
            if (this.article.internal_image) {
                this.internal_image = {
                    name: this.article.internal_image,
                    url: this.article.internal_image_url,
                }
            }
        }
    },
    methods: {
        save() {
            this.form.disabledButton = true;
            this.form.validation = null;
            showLoading();
            axios.post(this.$admin_url + '/' + this.route + '/store', {
                id: this.id,
                title: this.title,
                short_description: this.short_description,
                a_content: this.content,
                meta_description: this.meta_description,
                meta_keywords: this.meta_keywords,
                status: this.status,
                video_url: this.video_url,
                external_image: this.setExternalImage(),
                internal_image: this.setInternalImage(),
            }).then(response => {
                hideLoading();
                this.form.disabledButton = false;
                swalSuccess(response.data.message);
                adminRedirectTo(this.route);
            }).catch(error => {
                hideLoading();
                this.form.disabledButton = false;
                this.form.validation = error.response.data.errors;
                swalError(error);
            })
        },
        setInternalImage() {
            return this.internal_image && this.internal_image.file_link ? this.internal_image.file_link : (this.internal_image && this.internal_image.url ? this.internal_image.name : this.internal_image);
        },
        setExternalImage() {
            return this.external_image && this.external_image.file_link ? this.external_image.file_link : (this.external_image && this.external_image.url ? this.external_image.name : this.external_image);
        },
    }
});
