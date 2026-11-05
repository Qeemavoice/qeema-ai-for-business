Vue.component('notifications-index', {
    data() {
        return {
            route: 'notifications',
            notifications: [],
        }
    },
    props: {},
    mounted() {
        this.fetchData(this.route);
    },
    methods: {}
});

