Vue.component('favorites-index', {
    data() {
        return {
            route: 'clients/favorites',
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
    props: {
    },
    mounted() {
        this.fetchData(this.route);
    },
    methods: {

    }
});

