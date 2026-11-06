Vue.component('order-show', {
    data() {
        return {
            route: 'orders',
            status: null,
        }
    },
    props: ['order', 'order_status'],
    mounted() {
        if (this.order) {
            this.status = this.order.status.id
        }
    },
    methods: {
        changeStatus() {
            axios.post(this.$admin_url + '/' + this.route + '/' + this.order.id + '/change-status', {
                status: this.status
            }).then(response => {
                swalSuccess(response.data.message);
                this.fetchData(this.route);
            }).catch(error => {
                swalError(error);
            })
        },
    }
});
