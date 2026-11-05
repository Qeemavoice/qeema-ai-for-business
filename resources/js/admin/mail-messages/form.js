Vue.component('mail-message-form', {
    data() {
        return {
            route: 'mail-messages',
            id: null,
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },
    mounted() {
    },
    methods: {
        save() {
            this.form.disabledButton = true;
            this.form.validation = null;
            showLoading();
            axios.post(this.$admin_url + '/' + this.route + '/store', {
                id: this.id,
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
        cancel() {
            Swal.fire({
                title: this.$t('art_you_close', {name: name}),
                text: this.$t('you_wont_be_able_to_revert_this'),
                icon: "warning",
                confirmButtonColor: '#f64e60',
                showCancelButton: true,
                confirmButtonText: this.$t('yes_it'),
                cancelButtonText: this.$t('cancel')
            }).then((result) => {
                if (result.value) {
                    adminRedirectTo(this.route);
                }
            });
        }
    }
});
