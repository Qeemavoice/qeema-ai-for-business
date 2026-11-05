Vue.component('order-details-index', {
    data() {
        return {
            route: 'orders',
            transactions: [],
            ordersCancellation: [],
            pageTransactions: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10
            },
            pageOrdersCancellation: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10
            },
            filter: {
                orderId: null,
            },
            status: '',
        }
    },
    props: {
        order: null,
    },
    mounted() {
        if (this.order) {
            this.filter.orderId = this.order.id;
        }
        this.fetchTransactions();
        this.fetchOrdersCancellation();
    },
    methods: {
        async fetchTransactions() {
            showLoading();
            await axios.get(ADMIN_URL + '/transactions/data', {
                params: {
                    page: this.pageTransactions.currentPage,
                    filter: this.filter,
                    limit: this.limit,
                }
            }).then(response => {
                hideLoading();
                this.transactions = response.data.data.data;
                this.pageTransactions.totalPages = response.data.data.meta.last_page;
                this.pageTransactions.totalItems = response.data.data.meta.total;
            }).catch(error => {
                hideLoading();
            });
        },
        async fetchOrdersCancellation() {
            showLoading();
            await axios.get(ADMIN_URL + '/orders-cancellation-requests/data', {
                params: {
                    page: this.pageOrdersCancellation.currentPage,
                    filter: this.filter,
                    limit: this.limit,
                }
            }).then(response => {
                hideLoading();
                this.transactions = response.data.data.data;
                this.pageOrdersCancellation.totalPages = response.data.data.meta.last_page;
                this.pageOrdersCancellation.totalItems = response.data.data.meta.total;
            }).catch(error => {
                hideLoading();
            });
        },
        nextPageTransactions(val) {
            this.pageTransactions.currentPage = val;
            this.fetchTransactions();
        },
        nextPageOrdersCancellation(val) {
            this.pageOrdersCancellation.currentPage = val;
            this.fetchOrdersCancellation();
        },
        acceptOrderCancellation(id, name) {
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
                        this.fetchOrdersCancellation(this.route);
                    }).catch(error => {
                        hideLoading();
                        swalError(error);
                    })
                }
            });
        },
        rejectOrderCancellation(id, name) {
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
                        this.fetchOrdersCancellation(this.route);
                    }).catch(error => {
                        hideLoading();
                        swalError(error);
                    })
                }
            });
        },
        changeStatus() {
            axios.post(ADMIN_URL + '/' + this.route + '/update', {
                id: this.order.id,
                status: this.status,
            }).then(response => {
                swalSuccess(response.data.message);
            }).catch(error => {
                swalError(error);
            })
        },
        showResponseTransactionModal() {
            $("#modal_response_transaction").modal("show");
        },
    }
});
