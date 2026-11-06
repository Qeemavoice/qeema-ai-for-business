Vue.component('partners-show', {
    data() {
        return {
            route: 'partners',
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
        this.fetchData(this.route);
    },
    methods: {}
});
