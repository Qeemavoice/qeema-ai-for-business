Vue.component('setting-currencies-form', {
    data() {
        return {
            route: 'settings',
            default_currency: '',
            currencies: [],
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            },
        }
    },
    props: {
        settings: null,
        page: null,
    },
    mounted() {
        this.getCurrencies();

        if (this.settings) {
            this.settings.forEach((obj, index) => {
                if (obj.key === 'default_currency') {
                    this.default_currency = obj.value ? obj.value : '';
                }
            });
        }
    },
    methods: {
        save() {
            showLoading();
            this.form.disabledButton = true;
            this.form.loadingDisplay = true;
            this.form.validation = null;
            axios.post(ADMIN_URL + '/' + this.route + '/store', {
                default_currency: this.default_currency,
                key: this.page,
            }).then(response => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                swalSuccess(response.data.message);
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                this.form.validation = error.response.data.errors;
                swalError(error);
            })
        },
        async getCurrencies() {
            await axios.get(this.$admin_url + '/currencies/all').then(response => {
                this.currencies = response.data.data;
            });
        }
    }
});

