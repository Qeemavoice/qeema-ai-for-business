Vue.component('admins-show', {
    data() {
        return {
            route: 'admins',
            data: [],
            page: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10
            },
            filter: {
                searchText: '',
                role_id: null,
            },
        }
    },
    mounted() {
       this.fetchData(this.route);
    },
    methods: {
    }
});
