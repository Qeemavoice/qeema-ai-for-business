Vue.component('permissions-show', {
    data() {
        return {
            route: 'permissions',
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
        this.fetchData();
    },
    methods: {
        showAdvancedFilter() {

        },
        async fetchData() {
            showLoading();
            await axios.get(this.$admin_url + "/" + this.route + '/data', {
                params: {
                    page: this.page.currentPage,
                    filter: this.filter,
                    limit: this.page.itemsPerPage,
                }
            }).then(response => {
                hideLoading();
                this.data = response.data.data.data;
                this.page.totalPages = response.data.data.meta.last_page;
                this.page.totalItems = response.data.data.meta.total;
            }).catch(error => {
                hideLoading();
            });
        },
        nextPage(val) {
            this.page.currentPage = val;
            this.fetchData();
        },
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
                        this.fetchData();
                    }).catch(error => {
                        hideLoading();
                        swalError(error);
                    });
                }
            });
        },
    }
});
