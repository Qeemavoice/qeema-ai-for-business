Vue.component('voices-section-home-page', {
    data() {
        return {
            route: 'settings',
            key: 'home_page_voices_section',
            value: {
                title: languages(),
                sub_title: languages(),
                voices_ids: []
            },
            voices: [],
            form: {
                validation: null,
                disabledButton: false,
                loadingVoicesList: false,
            },
        }
    },
    props: ['home_page_voices_section'],
    watch: {
        home_page_voices_section: function (val) {
            if (val) {
                this.voices = val.voices_ids;
                this.value.title = val.title;
                this.value.sub_title = val.sub_title;

                $.each(this.voices, (key, value) => {
                    this.value.voices_ids.push(value.id);
                });
            }
        }
    },
    mounted() {
       // console.log(this.home_page_voices_section)
    },
    methods: {
        getVoices(query) {
            if (query !== '' && query.length >= 3) {
                this.form.loadingVoicesList = true;
                axios.get(this.$admin_url + '/voices/search', {
                    params: {
                        query: query
                    }
                }).then(response => {
                    this.form.loadingVoicesList = false;
                    this.voices = response.data.data.data;
                }).catch(error => {
                    this.form.loadingVoicesList = false;
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
