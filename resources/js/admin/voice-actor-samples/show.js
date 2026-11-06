Vue.component('voice-actor-samples-show', {
    data() {
        return {
            route: 'voice-actor-samples',
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
            status:'',
        }
    },
    mounted() {
        this.fetchData(this.route);
    },
    methods: {
        showAdvancedFilter() {

        },
        changeStatus(id) {
            if(this.status!=='')
            {
                showLoading();

                axios.put(this.$admin_url + '/' + this.route +'/'+id+ '/change-status', {
                    status : this.status
                }).then(response => {
                    hideLoading();
                    swalSuccess(response.data.message);
                    this.fetchData(this.route);
                }).catch(error => {
                    hideLoading();
                    swalError(error);
                });
            }
        }
    }

});
