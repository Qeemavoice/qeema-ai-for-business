Vue.component('faqs-section-home-page', {
    data() {
        return {
            route: 'settings',
            key: 'home_page_faqs_section',
            value: {
                faqs_ids: []
            },
            faqs: [],
            form: {
                validation: null,
                disabledButton: false,
                loading: false,
            },
        }
    },
    props: ['home_page_faqs_section'],
    watch: {
        home_page_faqs_section: function (val) {
            if (val) {
                this.faqs = val;
                $.each(val, (key, value) => {
                    this.value.faqs_ids.push(value.id);
                });
            }
        }
    },
    mounted() {},
    methods: {
        getFaqs(query) {
            if (query !== '' && query.length >= 3) {
                this.form.loading = true;
                axios.get(this.$admin_url + '/faqs/search', {
                    params: {
                        query: query
                    }
                }).then(response => {
                    this.form.loading = false;
                    this.faqs = response.data.data.data;
                }).catch(error => {
                    this.form.loading = false;
                    swalError(error);
                })
            }
        },
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
