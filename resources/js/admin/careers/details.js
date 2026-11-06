Vue.component('careers-details', {
    data() {
        return {
            route: 'careers',
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
    props: ['job'],
    mounted() {
        this.fetchData();
    },
    methods: {
        async fetchData() {
            showLoading();
            await axios.get(this.$admin_url + "/" + this.route + "/" + this.job.id + "/details/data", {
                params: {
                    page: this.page.currentPage,
                    filter: this.filter,
                    limit: this.page.itemsPerPage,
                }
            }).then(response => {
                hideLoading();
                this.data = response.data.data.data;
                this.page.totalPages = response.data.data.meta.last_page;
                this.page.totalItems = response.data.data.meta.total;
            }).catch(error => {
                hideLoading();
            });
        },
        nextPage(val) {
            this.page.currentPage = val;
            this.fetchData();
        },
    }
});
