Vue.component('invoices-index', {
    data() {
        return {
            route: 'clients/invoices',
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
    props: {},
    mounted() {
        this.fetchData(this.route);
    },
    methods: {}
});

