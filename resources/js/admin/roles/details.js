Vue.component('role-details', {
    data() {
        return {
            route: 'roles',
            data: [],
            filter: {
                searchText: '',
            },
            page: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10
            },
        }
    },
    props: ['role'],
    mounted() {
        this.fetchData();
    },
    methods: {
        async fetchData() {
            showLoading();
            await axios.get(this.$admin_url + '/' + this.route + '/' + this.role.id + '/admins-assigned', {
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
                    axios.delete(this.$admin_url + "/" + this.route + "/" + this.role.id + '/' + id + "/admin-assigned-delete").then(response => {
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
