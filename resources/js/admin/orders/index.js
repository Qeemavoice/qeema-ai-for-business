Vue.component('orders-index', {
    data() {
        return {
            route: 'orders',
            user: '',
            data: [],
            page: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10
            },
            filter: {
                id: null,
                searchText: '',
            },
        }
    },
    props: {
        id: null,
    },
    mounted() {
        if (this.id) {
            this.filter.id = this.id;
        }
        this.fetchData(this.route);
    },
    methods: {
        changeStatus(user_id) {
            axios.post(this.$admin_url + '/' + this.route + '/' + user_id + '/change-status', {}).then(response => {
                swalSuccess(response.data.message);
                this.fetchData();
            }).catch(error => {
                swalError(error);
            })
        },

    }
});
