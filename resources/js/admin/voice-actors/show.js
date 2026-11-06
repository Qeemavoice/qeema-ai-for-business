Vue.component('voice-actors-show', {
    data() {
        return {
            route: 'voice-actors',
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
