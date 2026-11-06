Vue.component('voice-actor-form', {
    data() {
        return {
            route: 'voice-actors',
            id: null,
            email: null,
            mobile: null,
            full_name: languages(),
            languages: [],
            country: '',
            payment_method: '',
            price_per_minute: 0.0,
            form: {
                validation: null,
                disabledButton: false,
            },
            LANGUAGES: JSON.parse(LANGUAGES),
        }
    },
    computed: {
        total_price() {
            return this.price_per_minute;
        },
    },
    props: ['voiceActor'],
    mounted() {
        if (this.voiceActor) {
            this.id = this.voiceActor.id
            this.email = this.voiceActor.email
            this.mobile = this.voiceActor.mobile
            this.full_name = this.voiceActor.full_name
            this.languages = this.voiceActor.languages
            this.country = this.voiceActor.country
            this.payment_method = this.voiceActor.payment_methods
            this.price_per_minute = this.voiceActor.price_per_minute
        }
    },
    methods: {
        getVoiceOvers(query) {
            if (query.length >= 3) {
                axios.get(this.$admin_url + '/voice-overs/search', {
                    params: {
                        query: query
                    }
                }).then(response => {
                    this.voiceovers = response.data.data.data;
                }).catch(error => {
                    // swalError(error);
                })
            }
        },
        save() {
            this.form.disabledButton = true;
            this.form.validation = null;
            showLoading();
            axios.post(this.$admin_url + '/' + this.route + '/store', {
                id: this.id,
                email: this.email,
                mobile: this.mobile,
                full_name: this.full_name,
                languageIds: this.languages,
                country: this.country,
                payment_method: this.payment_method,
                price_per_minute: this.price_per_minute,
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
        clearInputPricePerMinuteDefault() {
            if (this.price_per_minute == 0.0)
                this.price_per_minute = null;
        }
    }
});
