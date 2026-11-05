Vue.component('orders-cancellation-requests-index', {
    data() {
        return {
            route: 'orders-cancellation-requests',
            data: [],
            page: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10
            },
            filter: {
                searchText: '',
            },
        }
    },

    mounted() {
        this.fetchData(this.route);
    },
    methods: {
        accept(id, name) {
            Swal.fire({
                title: this.$t('are_you_accept', {name: name}),
                text: this.$t('you_wont_be_able_to_revert_this'),
                icon: "warning",
                confirmButtonColor: '#F64E60',
                showCancelButton: true,
                confirmButtonText: this.$t('yes_accept'),
                cancelButtonText: this.$t('cancel')
            }).then((result) => {
                if (result.value) {
                    showLoading();
                    axios.put(this.$admin_url + '/' + this.route + '/' + id + '/accept', {}).then(response => {
                        hideLoading();
                        swalSuccess(response.data.message);
                        this.fetchData(this.route);
                    }).catch(error => {
                        hideLoading();
                        swalError(error);
                    })
                }
            });
        },
        reject(id, name) {
            Swal.fire({
                title: this.$t('are_you_reject', {name: name}),
                text: this.$t('you_wont_be_able_to_revert_this'),
                icon: "warning",
                confirmButtonColor: '#F64E60',
                showCancelButton: true,
                confirmButtonText: this.$t('yes_reject'),
                cancelButtonText: this.$t('cancel')
            }).then((result) => {
                if (result.value) {
                    showLoading();
                    axios.put(this.$admin_url + '/' + this.route + '/' + id + '/reject', {}).then(response => {
                        hideLoading();
                        swalSuccess(response.data.message);
                        this.fetchData(this.route);
                    }).catch(error => {
                        hideLoading();
                        swalError(error);
                    })
                }
            });
        },
    }
});
