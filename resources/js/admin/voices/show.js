Vue.component('voices-show', {
    data() {
        return {
            route: 'voices',
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
    methods: {
        showAdvancedFilter() {

        },
    }
});
