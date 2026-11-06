Vue.component('voices-search', {
    data() {
        return {
            route: 'voices',
            data: [],
            filter: {
                searchText: '',
                language: '0',
                type: '0',
                dialect: '0',
                categories: [],
            },
            orderBy: {
                column: 'most_requested',
                direction: 'desc',
            },
            page: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10
            }
        }
    },
    props: {
        category: null,
    },
    mounted() {

        if (this.category) {
            let id = getIdBySlug(this.category);
            this.checkedCategoryField(id);
            this.fetchDataMore();
        } else {
            this.fetchDataMore();
        }
    },
    methods: {
        search() {
            this.fetchDataMore();
        },
        checkedCategoryField(id) {
            if ($("#category_" + id).hasClass("td-checked")) {
                $('#category_' + id).removeClass('td-checked');
                this.filter.categories.splice(this.filter.categories.indexOf(id), 1)
            } else {
                $('#category_' + id).addClass('td-checked');
                this.filter.categories.push(id);
            }
        },
        // getMore() {
        //     if (this.data.length < this.page.totalItems) {
        //         this.page.currentPage++;
        //         this.fetchDataMore();
        //     }
        // },
        async fetchDataMore() {
            this.form.loadingDisplay = true;
            await axios.get(this.$base_url + "/" + this.route + '/do/load-more', {
                params: {
                    page: this.page.currentPage,
                    filter: this.filter,
                    limit: this.limit,
                    orderBy: this.orderBy,
                }
            }).then(response => {
                this.form.loadingDisplay = false;
                this.page.totalItems = response.data.data.currentPage;
                this.page.total = response.data.data.total;

                if (this.page.currentPage === 1) {
                    this.data = response.data.data.data;
                } else {
                    document.getElementById('post-data').innerHTML = response.data.data.html;
                }

            }).catch(error => {
                this.form.loadingDisplay = false;
            });
        },

        async loadMore() {
            //if (this.data.length < this.page.totalItems) {
            this.page.currentPage++;
            await this.fetchDataMore();
            // }
        },
    }
});

