Vue.component('feedback-form', {
    data() {
        return {
            route: '/rating',
            comment: '',
            criterias: [],
            rating: {
                criterias: [],
                comment: null
            },
            group_id: null,
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            },
        }
    },
    props: {
        isClientRated: false,
        orderId: null,
    },
    watch: {},
    computed: {},
    mounted() {
        if (this.isClientRated) {
            this.getCriterias();
        }
    },
    methods: {
        sendFeedback() {
            this.form.loadingDisplay = true;
            this.form.disabledButton = true;
            this.form.validation = null;
            axios.post(this.$base_url + '/' + this.route + '/send', {
                criterias: this.rating.criterias,
                comment: this.rating.comment,
                order_id: this.orderId,
                group_id: this.group_id,
            }).then(response => {
                toastSuccess();
                this.resetForm();
                toastSuccess(response.data.message);
                window.location.reload();
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.validation = error.response.data.errors;
                toastError(error);
            });
        },
        changeRate(value, id, index) {
            let r = this.rating.criterias.filter(q => q.id === id);
            if (r.length > 0) {
                $.each(this.rating.criterias, (k, v) => {
                    if (v.id === id) {
                        this.rating.criterias[k]['value'] = value;
                    }
                });
            } else {
                this.rating.criterias.push({
                    value: value,
                    id: id,
                    index: index
                });
            }
        },
        getCriterias() {
            this.form.loadingDisplay = true;
            axios.get(this.$base_url + '/rating/get-criterias', {}).then(response => {
                this.criterias = response.data.data;
                if (this.criterias.length > 0) {
                    this.group_id = this.criterias[0].group_id;
                }
                this.form.loadingDisplay = false;

            }).catch(error => {
                this.form.loadingDisplay = false;
                toastError(error);
            })
        },
        resetForm() {
            this.form.disabledButton = false;
            this.form.loadingDisplay = false;
            this.form.validation = null;
            this.comment = '';
            this.rating = {criterias: [], comment: null};
            $('#rating_form').modal('hide');
        }
    }
});

