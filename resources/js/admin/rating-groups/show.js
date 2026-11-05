Vue.component('rating-groups-show', {
    data() {
        return {
            route: 'rating-groups',
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
            dialogVisibleCriteriasGroup: false,
            groupName: '',
            criterias: [],
        }
    },
    mounted() {
        this.fetchData(this.route);
    },
    methods: {
        criteriasGrpup(id, groupName) {
            showLoading();
            axios.get(this.$admin_url + '/' + this.route + '/' + id + '/criterias').then(response => {
                hideLoading();
                this.dialogVisibleCriteriasGroup = true;
                this.groupName = groupName[this.$lang];
                this.criterias = response.data.criterias;
            });
        },
        groupDeActivate(id, name) {
            Swal.fire({
                title: ' Are you sure to deactive the group ' + name + '?',
                text: "",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'No',
                confirmButtonText: 'Yes',
            }).then((result) => {
                if (result.value) {
                    showLoading();
                    axios.put(ADMIN_URL + "/ratings/groups/" + id + "/deactive").then(response => {
                        hideLoading();
                        swalSuccess(response.data.message);
                        this.$refs.table.refresh();
                    }).catch(error => {
                        swalError(error);
                    });
                }
            });
        },
        groupActive(id, name) {
            Swal.fire({
                title: ' Are you sure to active the group ' + name + '?',
                text: "",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'No',
                confirmButtonText: 'Yes',
            }).then((result) => {
                if (result.value) {
                    showLoading();
                    axios.put(ADMIN_URL + "/ratings/groups/" + id + "/active").then(response => {
                        hideLoading();
                        swalSuccess(response.data.message);
                        this.$refs.table.refresh();
                    }).catch(error => {
                        swalError(error);
                    });
                }
            });
        }
    }
});
