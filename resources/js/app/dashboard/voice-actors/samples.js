Vue.component('voice-actor-samples-index', {
    data() {
        return {
            route: 'voice-actors/samples',
            id: null,
            title: '',
            category: '',
            language: '',
            dialect: '',
            dialects: [],
            price_per_minute: '',
            audio_file: null,
            sample: null,
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
                storeLoadingDisplay: false,
            },
            page: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10
            },
        }
    },
    props: {
        user: null,
    },
    mounted() {
        this.fetchData(this.route);

        // $('#modal_store_sample').on('hidden.bs.modal', function (e) {
        //     this.resetForm();
        // });
        //
        // $('#modal_store_sample').on('shown.bs.modal', function () {
        // });
    },
    methods: {
        showFormStoreSampleModal() {
            this.resetForm();
            $('#modal_store_sample').modal('show');
        },
        save() {
            this.form.storeLoadingDisplay = true;
            this.form.disabledButton = true;
            this.form.validation = null;
            axios.post(this.$base_url + '/voice-actors/samples/store', {
                id: this.id,
                title: this.title,
                language: this.language,
                dialect: this.dialect,
                category: this.category,
                price_per_minute: this.price_per_minute,
                audio_file: this.setAudioFile(),
            }).then(response => {
                this.form.storeLoadingDisplay = false;
                this.form.disabledButton = false;
                this.form.validation = null;
                toastSuccess();
                $('#modal_store_sample').modal('hide');
                this.resetForm();
                this.fetchData(this.route);
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.storeLoadingDisplay = false;
                this.form.validation = error.response.data.errors;
                toastError(error);
            })
        },
        async editSample(voiceId) {
            this.form.loadingDisplay = true;
            await axios.get(this.$base_url + '/' + this.route + '/' + voiceId + '/edit/', {}).then(response => {
                this.sample = response.data.data;
                this.setSampleData();
                this.form.loadingDisplay = false;
                $('#modal_store_sample').modal('show');
            }).catch(error => {
                this.form.loadingDisplay = false;
                toastError(error);
                this.form.validation = error.response.data.errors;
            });
        },
        async setSampleData() {
            if (this.sample) {
                this.id = this.sample.id;
                this.title = this.sample.title[this.$lang];

                if (this.sample.category) {
                    this.category = this.sample.category.category_id;
                }

                this.language = this.sample.language_id;

                if (this.sample.audio_file) {
                    this.audio_file = {
                        name: this.sample.audio_file,
                        url: this.sample.audio_file_url,
                    }
                }

                this.price_per_minute = this.sample.price_per_minute;
                await this.getDialectsByLanguage();
                this.dialect = this.sample.dialect_id;
            }
        },
        resetForm() {
            this.id = null;
            this.title = null;
            this.category = '';
            this.language = '';
            this.dialect = '';
            this.price_per_minute = '';
            this.audio_file = null;
            this.form.validation = null;
            this.form.loadingDisplay = false;
            this.form.disabledButton = false;
        },
        async getDialectsByLanguage() {
            this.form.storeLoadingDisplay = true;
            await axios.get(this.$base_url + '/voice-actors/dialects/get-by-languageId', {
                params: {
                    language: this.language,
                }
            }).then(response => {
                this.storeLoadingDisplay = false;
                this.dialects = response.data.data;
            }).catch(error => {
                this.form.storeLoadingDisplay = false;
            });
        },
        setAudioFile() {
            return this.audio_file && this.audio_file.file_link ? this.audio_file.file_link : (this.audio_file && this.audio_file.url ? this.audio_file.name : this.audio_file);
        },
    }
});

