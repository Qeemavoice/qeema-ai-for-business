Vue.component('profit-form', {
    data() {
        return {
            route: 'profits',
            voiceover: '',
            id: null,
            amount: null,
            receipt: null,
            transaction_id: null,
            withdrawal_method: '',
            voiceovers: [],
            form: {
                validation: null,
                disabledButton: false,
                loadingVoiceActorList: false,
            },
        }
    },
    props: ['profit'],
    mounted() {
        if (this.profit) {
            this.id = this.profit.id
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
                voiceover: this.voiceover,
                amount: this.amount,
                transaction_id: this.transaction_id,
                receipt: this.setFile(),
                withdrawal_method: this.withdrawal_method,
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
        setFile() {
            return this.receipt && this.receipt.file_link ? this.receipt.file_link : (this.receipt && this.receipt.url ? this.receipt.name : this.audio_file);
        },
    }
});
