Vue.component('mailing-lists-show', {
    data() {
        return {
            route: 'mailing-lists',
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
