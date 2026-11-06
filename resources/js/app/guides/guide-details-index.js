Vue.component('guide-details-index', {
    data() {
        return {
            guide_id: null,
            name: '',
            details: '',
            email: '',
            comments: [],
            form: {
                validation: null,
                disabledButton: false,
                disabledButtonLike: false,
                loadingDisplay: false,
                loadingDisplayComments: false,
            }
        }
    },
    props: {
        guide: null,
        showModalPaymentPurchase:null,
    },
    mounted() {
        if (this.guide) {
            this.guide_id = this.guide.id;
        }
        if(this.showModalPaymentPurchase) {
            this.payment();
        }
        this.getComments();
    },
    methods: {
        showLogin() {
            localStorage.setItem('redirectTo', window.location.href+'?showModalPaymentPurchase=1');
            $('#modal_login').modal('show');
        },
        doLike() {
            this.disabledButtonLike = true;
            axios.post(this.$base_url + '/guides/details/likes/store', {
                guide_id: this.guide_id,
            }).then(response => {
                $('#number_of_likes').html(response.data.data.number_of_likes);
                toastSuccess();
            }).catch(error => {
                this.form.validation = error.response.data.errors;
                this.disabledButtonLike = false;
                toastError(error);
            })
        },
        addComment() {
            this.form.loadingDisplay = true;
            this.form.disabledButton = true;
            this.form.validation = null;
            axios.post(this.$base_url + '/guides/details/comments/store', {
                guide_id: this.guide_id,
                name: this.name,
                details: this.details,
                email: this.email,
            }).then(response => {
                toastSuccess();
                this.resetForm();
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                this.form.validation = error.response.data.errors;
                toastError(error);
            })
        },
        getComments() {
            this.form.loadingDisplayComments = true;
            this.form.validation = null;
            axios.get(this.$base_url + '/guides/details/comments/data', {
                guide_id: this.guide_id,
            }).then(response => {
                this.form.loadingDisplayComments = false;
                this.comments = response.data.data.data;
            }).catch(error => {
                this.form.loadingDisplayComments = false;
                toastError(error);
            })
        },
        payment() {
            $('#modal_payment_purchase').modal('show');
        },
        resetForm() {
            this.guide_id = null;
            this.name = '';
            this.email = '';
            this.details = '';
            this.form.loadingDisplay = false;
            this.form.disabledButton = false;
            this.form.validation = null;
        }
    }
});

