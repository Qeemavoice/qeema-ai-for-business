Vue.component('guide-details', {
    data() {
        return {
            route: 'guides',
            id: null,
            downloads: [],
            comments: [],
            page1: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10
            },
            page2: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10
            },
        }
    },
    props: ['guide'],
    mounted() {
        if (this.guide) {
            if (this.comments.length <= 0)
                this.fetchComments();

            if (this.downloads.length <= 0)
                this.fetchDownloads();
        }
    },
    methods: {
        changeStatus(id) {
            Swal.fire({
                title: this.$t('are_you_sure_about_this_procedure', {name: name}),
                text: this.$t('you_can_edit_the_status_at_any_time'),
                icon: "warning",
                confirmButtonColor: '#f64e60',
                showCancelButton: true,
                confirmButtonText: this.$t('yes_definitely'),
                cancelButtonText: this.$t('cancel')
            }).then((result) => {
                if (result.value) {
                    showLoading();
                    axios.put(this.$admin_url + "/" + this.route + '/' + this.guide.id + '/comments/change-status', {
                        id: id
                    }).then(response => {
                        hideLoading();
                        this.fetchComments();
                    }).catch(error => {
                        hideLoading();
                    });
                }
            });
        },
        async fetchComments() {
            showLoading();
            await axios.get(this.$admin_url + "/" + this.route + '/' + this.guide.id + '/comments/data', {
                params: {
                    page: this.page1.currentPage,
                    filter: this.filter,
                    limit: this.page1.itemsPerPage,
                }
            }).then(response => {
                hideLoading();
                this.comments = response.data.data.data;
                this.page1.totalPages = response.data.data.meta.last_page;
                this.page1.totalItems = response.data.data.meta.total;
            }).catch(error => {
                hideLoading();
            });
        },
        async fetchDownloads() {
            showLoading();
            await axios.get(this.$admin_url + "/" + this.route + '/' + this.guide.id + '/downloads/data', {
                params: {
                    page: this.page2.currentPage,
                    filter: this.filter,
                    limit: this.page2.itemsPerPage,
                }
            }).then(response => {
                hideLoading();
                this.downloads = response.data.data.data;
                this.page2.totalPages = response.data.data.meta.last_page;
                this.page2.totalItems = response.data.data.meta.total;
            }).catch(error => {
                hideLoading();
            });
        },
        nextPage1(val) {
            this.page1.currentPage = val;
            this.fetchComments();
        },
        nextPage2(val) {
            this.page2.currentPage = val;
            this.fetchDownloads();
        },
    }
});
