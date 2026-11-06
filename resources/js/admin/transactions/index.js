Vue.component('transactions-index', {
    data() {
        return {
            route: 'transactions',
            user : '',
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
            limit: 10,
            ADMIN_URL : ADMIN_URL,
            LANG:LANG
        }
    },

    mounted() {
        this.fetchData();
    },

    methods: {
        async fetchData() {
            showLoading();
            await axios.get(ADMIN_URL + "/" + this.route + '/data', {
                params: {
                    page: this.page.currentPage,
                    filter: this.filter,
                    limit: this.limit,
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

        changeStatus(user_id){
            axios.post(ADMIN_URL + '/' + this.route + '/' + user_id + '/change-status', {
            }).then(response => {
                swalSuccess(response.data.message);
                this.fetchData();
            }).catch(error => {
                swalError(error);
            })
        },
    }
});
