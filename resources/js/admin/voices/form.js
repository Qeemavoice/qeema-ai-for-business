Vue.component('voice-form', {
    data() {
        return {
            route: 'voices',
            id: null,
            title: languages(),
            meta_title: languages(),
            meta_description: languages(),
            audio_file: null,
            elevenlabs_voice_id: '',
            type: '',
            dialect: '',
            dialects: [],
            language: '',
            languages: [],
            voiceover: '',
            price_per_minute: 0.0,
            voiceovers: [],
            categories_ids: [],

            form: {
                validation: null,
                disabledButton: false,
                loadingVoiceActorList: false,
            },
        }
    },
    computed: {
        total_price() {
            return this.price_per_minute ? (parseFloat(this.price_per_minute) + platformCommission(this.price_per_minute)).toFixed(2) : 0;
        },
    },
    props: ['voice', 'commissions'],
    mounted() {
        let promiseGetLanguages = this.getLanguages();

        if (this.voice) {
            let queryVoiceover = this.voice.voice_over ? this.voice.voice_over.full_name[this.$lang] : null;
            let promiseGetVoiceOvers = this.getVoiceOvers(queryVoiceover);

            this.id = this.voice.id
            this.title = this.voice.title
            this.meta_title = this.voice.meta_title
            this.meta_description = this.voice.meta_description
            this.type = this.voice.voice_type_id
            this.elevenlabs_voice_id = this.voice.elevenlabs_voice_id || ''


            this.price_per_minute = this.voice.price_per_minute

            if (this.voice && this.voice.categories) {
                $.each(this.voice.categories, (key, value) => {
                    this.categories_ids.push(value.category_id);
                });
            }

            Promise.all([promiseGetLanguages, promiseGetVoiceOvers]).then((res) => {
                this.dialect = this.voice.dialect_id
                this.voiceover = this.voice.voiceover_id
            });

            if (this.voice.audio_file) {
                this.audio_file = {
                    name: this.voice.audio_file,
                    url: this.voice.audio_file_url,
                }
            }
        }
    },
    watch: {
        language: function (val) {
            $.each(this.languages, (key, value) => {
                if (value.id === val) {
                    this.dialects = value.dialects;
                    this.dialect = '';
                }
            });
        }
    },
    methods: {
        async getVoiceOvers(query = '') {
            this.form.loadingVoiceActorList = true;
            await axios.get(this.$admin_url + '/voice-actors/search', {
                params: {
                    query: query
                }
            }).then(response => {
                this.form.loadingVoiceActorList = false;
                this.voiceovers = response.data.data.data;
            }).catch(error => {
                this.form.loadingVoiceActorList = false;
                swalError(error);
            })
        },
        async searchVoiceOvers(query) {
            if (query && query !== '' && query.length >= 3) {
                await this.getVoiceOvers(query);
            }
        },
        save() {
            this.form.disabledButton = true;
            this.form.validation = null;
            showLoading();
            axios.post(this.$admin_url + '/' + this.route + '/store', {
                id: this.id,
                title: this.title,
                meta_description: this.meta_description,
                meta_title: this.meta_title,
                audio_file: this.setAudioFile(),
                elevenlabs_voice_id: this.elevenlabs_voice_id,
                type: this.type,
                dialect: this.dialect,
                language: this.language,
                voiceover: this.voiceover,
                price_per_minute: this.price_per_minute,
                categories_ids: this.categories_ids,
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
        setAudioFile() {
            return this.audio_file && this.audio_file.file_link ? this.audio_file.file_link : (this.audio_file && this.audio_file.url ? this.audio_file.name : this.audio_file);
        },
        async getLanguages() {
            await axios.get(this.$admin_url + '/languages/all').then(response => {
                this.languages = response.data.data;
                this.language = this.voice.language_id
            }).catch(error => {
            });
        },
    }
});
