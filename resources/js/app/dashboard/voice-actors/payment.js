Vue.component('voice-actor-payment-index', {
    data() {
        return {
            route: 'voice-actors/payments',
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            }
        }
    },
    mounted() {
        this.fetchData(this.route);
    },
    methods: {
    }
});

