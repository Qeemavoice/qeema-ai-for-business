Vue.component('mail-message-details', {
    data() {
        return {
            route: 'mail-messages',
        }
    },
    props: ['message'],
    mounted() {
    },
    methods: {
        deleteRow(id, name) {
            Swal.fire({
                title: this.$t('art_you_delete', {name: name}),
                text: this.$t('you_wont_be_able_to_revert_this'),
                icon: "warning",
                confirmButtonColor: '#F64E60',
                showCancelButton: true,
                confirmButtonText: this.$t('yes_delete_it'),
                cancelButtonText: this.$t('cancel')
            }).then((result) => {
                if (result.value) {
                    showLoading();
                    axios.delete(this.$admin_url + "/" + this.route + "/" + id + "/delete").then(response => {
                        hideLoading();
                        sweetAlertDelete();
                        redirectTo(this.$base_url_redirect_to + this.route)
                    }).catch(error => {
                        hideLoading();
                        swalError(error);
                    });
                }
            });
        },
    }
});
