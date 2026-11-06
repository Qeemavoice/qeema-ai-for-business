Vue.component('categories-section-home-page', {
    data() {
        return {
            route: 'settings',
            key: 'home_page_categories_section',
            value: {
                title: languages(),
                sub_title: languages(),
            },
            voices: [],
            form: {
                validation: null,
                disabledButton: false,
                loadingVoicesList: false,
            },
        }
    },
    props: ['home_page_categories_section'],
    watch: {
        home_page_categories_section: function (val) {
            if (val) {
                this.value.title = val.title;
                this.value.sub_title = val.sub_title;
            }
        }
    },
    mounted() {
        //console.log(this.home_page_categories_section)
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
