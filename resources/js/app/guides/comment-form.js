Vue.component('guide-comment-form', {
    data() {
        return {
            guide_id: null,
            name: '',
            details: '',
            email: '',
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            }
        }
    },
    props: {
        guide: null,
    },
    mounted() {
        if (this.guide) {
            this.guide_id = this.guide.id;
        }
    },
    methods: {
        addComment() {
            this.form.loadingDisplay = true;
            this.form.disabledButton = true;
            this.form.validation = null;
            axios.post(this.$base_url + '/guides/details/comments/store', {
                guide_id: this.guide_id,
                name: this.name,
                details: this.details,
                email: this.email,
            }).then(response => {
                toastSuccess();
                this.resetForm();
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                this.form.validation = error.response.data.errors;
                toastError(error);
            })
        },
        resetForm() {
            this.guide_id = null;
            this.name = '';
            this.email = '';
            this.details = '';
            this.form.loadingDisplay = false;
            this.form.disabledButton = false;
            this.form.validation = null;
        }
    }
});

