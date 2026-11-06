Vue.component('clients-show', {
    data() {
        return {
            route: 'clients',
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
                role_id: null,
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
    methods: {}
});
