Vue.component('orders-index', {
    data() {
        return {
            route: 'orders',
            data: [],
            orderDetails: null,
            ratingDetails: null,
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
    props: {},
    mounted() {
        this.fetchData(this.route);
    },
    methods: {
        detailsOrder(orderId) {
            this.form.loadingDisplay = true;
            this.form.loadingDisplay = true;
            axios.get(this.$base_url + '/' + this.route + '/details/' + orderId).then(response => {
                this.form.loadingDisplay = false;
                $('#modal_order_details').modal('show');
                this.orderDetails = response.data.data;
            }).catch(error => {
                this.form.loadingDisplay = false;
                toastError(error);
            })
        },
        ratingOrder(order) {
        },
        async detailsRating(orderId) {
            this.form.loadingDisplay = true;
            this.form.loadingDisplay = true;
            await axios.get(this.$base_url + '/rating/details', {
                params: {
                    orderId: orderId,
                }
            }).then(response => {
                this.form.loadingDisplay = false;
                this.ratingDetails = response.data.data;

                $('#modal_rating_details').modal('show');
            }).catch(error => {
                this.form.loadingDisplay = false;
                toastError(error);
            })
        },
        cancelOrder(orderId) {
            Swal.fire({
                title: this.$t('enter_reason_cancel_order', {name: orderId}),
                input: "textarea",
                inputLabel: this.$t('reasons'),
                inputPlaceholder: this.$t('enter_message_here'),
                showCancelButton: true,
                confirmButtonText: this.$t('send_request'),
                cancelButtonText: this.$t('cancel')
            }).then((result) => {
                let reasons = result.value;
                if (result.value) {
                    Swal.fire({
                        title: this.$t('are_you_confirm', {name: orderId}),
                        text: this.$t('you_wont_be_able_to_revert_this'),
                        icon: "warning",
                        confirmButtonColor: '#F64E60',
                        showCancelButton: true,
                        confirmButtonText: this.$t('yes_it'),
                        cancelButtonText: this.$t('cancel')
                    }).then((result) => {
                        if (result.value) {
                            this.form.loadingDisplay = true;
                            axios.put(this.$base_url + "/clients/" + this.route + "/" + orderId + "/cancellation-request", {
                                reasons: reasons,
                            }).then(response => {
                                toastSuccess(response.data.message);
                                this.fetchData(this.route);
                                this.form.loadingDisplay = false;
                            }).catch(error => {
                                this.form.loadingDisplay = false;
                                toastError(error);
                            });
                        }
                    });
                }
            });
        },
    }
});

