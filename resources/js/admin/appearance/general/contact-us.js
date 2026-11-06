Vue.component('general-contact-us', {
    data() {
        return {
            route: 'settings',
            key: 'general_contact_us',
            mobile_1: null,
            mobile_2: null,
            email: '',
            address: null,

            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },

    props: ['general_contact_us'],

    watch: {
        general_contact_us: function (v) {
            if (v) {
                this.mobile_1 = v.mobile_1
                this.mobile_2 = v.mobile_2
                this.email = v.email
                this.address = v.address
            }
        }
    },

    methods: {
        save() {
            this.form.disabledButton = true;
            this.form.validation = null;
            axios.post(ADMIN_URL + '/' + this.route + '/store', {
                key: this.key,
                mobile_1: this.mobile_1,
                mobile_2: this.mobile_2,
                email: this.email,
                address: this.address,
            }).then(response => {
                this.reset();
                swalSuccess(response.data.message);
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.validation = error.response.data.errors;
            })
        },
        reset() {
            this.form.disabledButton = false;
            this.form.validation = null;
        }

    }
});
