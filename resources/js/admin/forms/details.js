Vue.component('form-details-index', {
    data() {
        return {
            route: 'forms',
            answers: [],
            pageAnswers: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10
            },
        }
    },
    props: {
        form: null,
    },
    mounted() {
        this.fetchAnswers();
    },
    methods: {
        async fetchAnswers() {
            showLoading();
            await axios.get(ADMIN_URL + '/forms/'+this.form.id+'/details/data', {
                params: {
                    page: this.pageAnswers.currentPage,
                    filter: this.filter,
                    limit: this.limit,
                }
            }).then(response => {
                hideLoading();
                this.transactions = response.data.data.data;
                this.pageTransactions.totalPages = response.data.data.meta.last_page;
                this.pageTransactions.totalItems = response.data.data.meta.total;
            }).catch(error => {
                hideLoading();
            });
        },
        nextPageAnswers(val) {
            this.pageAnswers.currentPage = val;
            this.nextPageAnswers();
        },
    }
});
