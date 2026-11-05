Vue.component('mail-messages-show', {
    data() {
        return {
            route: 'mail-messages',
            data: [],
            checkedMessagesPerPage: [],
            checkedMessagesAll: [],
            page: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10
            },
            filter: {
                searchText: '',
                status: 'inbox', //inbox,importing,trash,draft
            },
        }
    },
    props: ['type'],
    mounted() {
        if (this.status) {
            this.filter.status = this.status;
        }
        this.fetchData(this.route);
    },
    methods: {
        fetchDataByStatus(status) {
            this.filter.status = status;
            this.fetchData(this.route);
        },
        changeType(id, name, type) {
            Swal.fire({
                title: this.$t('art_you_draft', {name: name}),
                text: this.$t('you_wont_be_able_to_revert_this'),
                icon: "warning",
                confirmButtonColor: '#F64E60',
                showCancelButton: true,
                confirmButtonText: this.$t('yes_it'),
                cancelButtonText: this.$t('cancel')
            }).then((result) => {
                if (result.value) {
                    showLoading();
                    axios.put(this.$admin_url + "/" + this.route + "/" + id + "/change-type", {
                        params: {
                            type: type
                        }
                    }).then(response => {
                        hideLoading();
                        swalSuccess(response.data.message);
                        this.fetchData();
                    }).catch(error => {
                        hideLoading();
                        swalError(error);
                    });
                }
            });
        },
        changeTypeAll(type) {

            if (this.isEmptyCheckedMessagesAll()) {
                swalError(this.$t('select_one_row_at_lest'));
                return false;
            }

            Swal.fire({
                title: this.$t('art_you_type', {name: name}),
                text: this.$t('you_wont_be_able_to_revert_this'),
                icon: "warning",
                confirmButtonColor: '#F64E60',
                showCancelButton: true,
                confirmButtonText: this.$t('yes_it'),
                cancelButtonText: this.$t('cancel')
            }).then((result) => {
                if (result.value) {
                    showLoading();
                    axios.put(this.$admin_url + "/" + this.route + "/change-type-all", {
                        params: {
                            type: type
                        }
                    }).then(response => {
                        hideLoading();
                        swalSuccess(response.data.message);
                        this.fetchData();
                    }).catch(error => {
                        hideLoading();
                        swalError(error);
                    });
                }
            });
        },
        deleteAll() {

            if (this.isEmptyCheckedMessagesAll()) {
                swalError(this.$t('select_one_row_at_lest'));
                return false;
            }

            Swal.fire({
                title: this.$t('art_you_delete_all'),
                text: this.$t('you_wont_be_able_to_revert_this'),
                icon: "warning",
                confirmButtonColor: '#F64E60',
                showCancelButton: true,
                confirmButtonText: this.$t('yes_delete_it'),
                cancelButtonText: this.$t('cancel')
            }).then((result) => {
                if (result.value) {
                    showLoading();
                    axios.delete(this.$admin_url + "/" + this.route + "/delete-all").then(response => {
                        hideLoading();
                        sweetAlertDelete();
                        this.fetchData();
                    }).catch(error => {
                        hideLoading();
                        swalError(error);
                    });
                }
            });
        },
        isEmptyCheckedMessagesAll() {
            return this.checkedMessagesAll.length <= 0;
        },
        checkAll() {
            // if (this.isEmptyCheckedMessagesAll()) {
            //     swalError(this.$t('select_one_row_at_lest'));
            //     return false;
            // }

            _.each(this.data, obj => {

                if (this.checkedMessagesAll.indexOf(obj.id) === -1) {

                    this.checkedMessagesAll.push(obj.id);

                    if (this.checkedMessagesPerPage.indexOf(obj.id) === -1) {
                        this.checkedMessagesPerPage.push(obj.id);
                    }
                }

            });

            // //this.checkedMessagesAll = [];
            // _.each(this.data, obj => {
            //     if (this.checkedMessagesPerPage.indexOf(obj.id) !== -1) {
            //         this.checkedMessagesAll.splice(this.checkedMessagesAll.indexOf(obj.id), 1)
            //     }
            // });
            // this.checkedMessagesPerPage = [];
        },
        checkMessagesPerPage(event) {
            let value = event.target.value;
            let is_checked = event.target.checked;

            if (is_checked) {
                this.checkedMessagesAll.push(value)
            } else {
                this.checkedMessagesAll.splice(this.checkedMessagesAll.indexOf(value), 1)
            }

        }
    }
});
