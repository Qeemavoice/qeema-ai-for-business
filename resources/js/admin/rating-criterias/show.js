Vue.component('rating-criterias-show', {
    data() {
        return {
            route: 'rating-criterias',
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
