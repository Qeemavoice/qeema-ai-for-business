Vue.component('setting-email-form', {
    data() {
        return {
            route: 'settings',
            email: {
                mail_driver: 'smtp',
                host: '',
                from_name: '',
                from_address: '',
                port: '',
                username: '',
                password: '',
                encryption: '',
            },
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            },
        }
    },
    props: {
        settings: null,
        page: null,
    },
    mounted() {
        if (this.settings) {
            this.settings.forEach((obj, index) => {
                if (obj.key === 'mail_driver')
                    this.email.mail_driver = obj.value;
                if (obj.key === 'mail_from_name')
                    this.email.from_name = obj.value;
                if (obj.key === 'mail_from_address')
                    this.email.from_address = obj.value;
                if (obj.key === 'mail_host')
                    this.email.host = obj.value;
                if (obj.key === 'mail_port')
                    this.email.port = obj.value;
                if (obj.key === 'mail_username')
                    this.email.username = obj.value;
                if (obj.key === 'mail_password')
                    this.email.password = obj.value;
                if (obj.key === 'mail_encryption')
                    this.email.encryption = obj.value ? obj.value : '';
            });
        }
    },
    methods: {
        save() {
            showLoading();
            this.form.disabledButton = true;
            this.form.loadingDisplay = true;
            this.form.validation = null;
            axios.post(ADMIN_URL + '/' + this.route + '/store', {
                mail_driver: this.email.mail_driver,
                mail_from_name: this.email.from_name,
                mail_from_address: this.email.from_address,
                mail_host: this.email.host,
                mail_port: this.email.port,
                mail_username: this.email.username,
                mail_password: this.email.password,
                mail_encryption: this.email.encryption,
                key: this.page,
            }).then(response => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                swalSuccess(response.data.message);
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                this.form.validation = error.response.data.errors;
                swalError(error);
            })
        },
        reset() {
            this.email = {
                mail_driver: 'smtp',
                host: '',
                from_name: '',
                from_address: '',
                port: '',
                username: '',
                password: '',
                encryption: '',
            };
        }
    }
});

