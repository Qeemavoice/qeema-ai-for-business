Vue.component('pages-show', {
    data() {
        return {
            route: 'pages',
            limit: 10,

            id: null,
            title: languages(),
            description: languages(),

            LANGUAGES: JSON.parse(LANGUAGES),

            form: {
                validation: null,
                disabledButton: false,
            },

        }
    },

    props: ['page'],

    mounted() {
         let page = this.page;
        if (this.page) {
            this.id = page.id
            this.title = page.title
            if (page.content) {
                this.description = page.content
            }
        }
    },
    methods: {
        save() {
            this.form.disabledButton = true;
            this.form.validation = null;
            axios.post(ADMIN_URL + '/' + this.route + '/store', {
                id: this.id,
                title: this.title,
                name: this.name,
                description: this.description,
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
