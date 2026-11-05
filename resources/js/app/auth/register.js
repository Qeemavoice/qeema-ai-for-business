Vue.component('register-form', {
    data() {
        return {
            type: this.$user_type_client,
            full_name: '',
            email: '',
            password: '',
            password_confirmation: '',
            i_agree: true,
            gender: '',
            country: '',
            business_link: '',
            price_per_hours: '',
            price_per_minute: '',
            whatsapp_number: '',
            work_field: '',
            work_fields: [],
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            }
        }
    }, props: {
        redirectUrl: null,
    },
    watch: {
        full_name: function (val) {
            if (val === '') {
                if (this.form.validation === null) {
                    this.form.validation = {full_name: [this.$t('full_name_is_required')]};
                } else {
                    Object.assign(this.form.validation, {full_name: [this.$t('full_name_is_required')]});
                }
            } else {
                if (this.form.validation && this.form.validation.full_name) {
                    Vue.delete(this.form.validation, 'full_name');
                }
            }
        },
        email: function (val) {
            if (val === '') {
                if (this.form.validation === null) {
                    this.form.validation = {email: [this.$t('email_is_required')]};
                } else {
                    Object.assign(this.form.validation, {email: [this.$t('email_is_required')]});
                }

            } else {
                if (isValidEmail(val) === false) {
                    if (this.form.validation === null) {
                        this.form.validation = {email: [this.$t('please_enter_a_valid_email_address')]};
                    } else {
                        Object.assign(this.form.validation, {email: [this.$t('please_enter_a_valid_email_address')]});
                    }
                } else {
                    if (this.form.validation && this.form.validation.email) {
                        Vue.delete(this.form.validation, 'email');
                    }
                }
            }
        },
        password: function (val) {
            if (val === '') {
                if (this.form.validation === null)
                    this.form.validation = {password: [this.$t('password_is_required')]};
                else
                    Object.assign(this.form.validation, {password: [this.$t('password_is_required')]});
            } else {
                if (this.checkPassword() === false)
                    return false;

                if (this.form.validation && this.form.validation.password) {
                    Vue.delete(this.form.validation, 'password');
                }
            }
        },
        gender: function (val) {
            if (val === '') {
                if (this.form.validation === null) {
                    this.form.validation = {gender: [this.$t('gender_is_required')]};
                } else {
                    Object.assign(this.form.validation, {gender: [this.$t('gender_is_required')]});
                }
            } else {
                if (this.form.validation && this.form.validation.gender) {
                    Vue.delete(this.form.validation, 'gender');
                }
            }
        },
    },
    mounted() {
        $('#modal_registration').on('hidden.bs.modal', (e) => {
            this.resetForm();
        });

        this.eventSetType();
    },
    methods: {
        doRegister() {
            if (this.type === this.$user_type_client && this.validationWork() === false)
                return false;

            this.form.loadingDisplay = true;
            this.form.disabledButton = true;
            this.form.validation = null;

            axios.post(this.$base_url + '/register', {
                type: this.type,
                full_name: this.full_name,
                email: this.email,
                password: this.password,
                password_confirmation: this.password_confirmation,
                i_agree: this.i_agree,
                work_fields: this.work_fields,
                work_field: this.work_field,
                gender: this.gender,
                country: this.country,
                business_link: this.business_link,
                price_per_minute: this.price_per_minute,
                price_per_hours: this.price_per_hours,
                whatsapp_number: this.whatsapp_number,
                redirectUrl: this.redirectUrl,
            }).then(response => {
                window.location.href = response.data.data.redirectTo;
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                this.form.validation = error.response.data.errors;
                toastError(error, 1000000, true);
            })
        },
        showLoginForm() {
            $("#modal_registration").modal("hide");
            $("#modal_login").modal("show");
        },
        eventSetType() {
            $(".step-box-content").removeClass("active");
            $('#type_' + this.type).addClass('active');
        },
        createAccountButton() {
            $('#step_1').removeClass('js-active');
            $('#step_2').addClass('js-active');
        },
        prevButton() {
            $('#step_1').addClass('js-active');
            $('#step_2').removeClass('js-active');
        },
        nextButton() {
            if (this.validationFormStep2() === false) {
                return false;
            }
            $('#step_2').removeClass('js-active');
            $('#step_3').addClass('js-active');
        },
        prevStep3ToStep2Button() {
            $('#step_2').addClass('js-active');
            $('#step_3').removeClass('js-active');
        },
        validationFormStep2() {
            if (this.full_name === '' || this.email === '' || this.password === '') {
                toastError(this.$t('all_fields_are_required'));
                return false;
            } else {
                if (isValidEmail(this.email) === false) {
                    toastError(this.$t('please_enter_a_valid_email_address'));
                    return false;
                }
            }


            if (this.password !== '') {
                if (this.checkPassword() === false) {
                    toastError(this.$t('password_matches'));
                    return false;
                }
            }

            this.form.validation = null;
            return true;
        },
        checkedWorkField(id) {
            if ($("#work_" + id).hasClass("active")) {
                $('#work_' + id).removeClass('active');
                this.work_fields.splice(this.work_fields.indexOf(id), 1)
            } else {
                $('#work_' + id).addClass('active');
                this.work_fields.push(id);
            }
        },
        checkedOtherWorkField() {
            if ($("#work_0").hasClass("active")) {
                $('#work_0').removeClass('active');
                $('#div_work_other').addClass('d-none');
                this.work_field = '';
            } else {
                $('#work_0').addClass('active');
                $('#div_work_other').removeClass('d-none');
            }
        },
        validationWork() {
            if (this.work_fields.length <= 0 && this.work_field === '' && !$('#work_0').hasClass('active')) {
                if (this.form.validation === null) {
                    this.form.validation = {work_fields: [this.$t('please_select_at_least_one_field')]};
                } else {
                    Object.assign(this.form.validation, {work_fields: [this.$t('please_select_at_least_one_field')]});
                }
                return false;
            }

            if ($('#work_0').hasClass('active') && this.work_field === '') {
                if (this.form.validation === null) {
                    this.form.validation = {work_field: [this.$t('please_enter_your_field_of_work')]};
                } else {
                    Object.assign(this.form.validation, {work_field: [this.$t('please_enter_your_field_of_work')]});
                }
                return false;
            }
            return true;
        },
        resetForm() {
            this.full_name = '';
            this.email = '';
            this.password = '';
            this.work_fields = [];
            this.work_field = [];
            this.type = this.$user_type_client;
            this.resetSteps();
            this.form.disabledButton = false;
            this.form.loadingDisplay = false;
            setTimeout(() => {
                this.form.validation = null;
            }, 2000)
        },
        resetSteps() {
            $('#step_2').removeClass('js-active');
            $('#step_3').removeClass('js-active');
            $('#step_1').addClass('js-active');
            $('.opti-list ul li').removeClass('active'); // remove checked working fields
            this.eventSetType(); // remove selected type
        },

        checkPassword() {
            const match0 = this.password.length > 8;
            const match1 = this.password.match(/[a-z]+/);
            const match2 = this.password.match(/[A-Z]+/);
            const match3 = this.password.match(/[0-9]+/);
            const match4 = this.password.match(/[{}!@#$%^&*()_+<>?":|/-]+/);

            if (!match1) {
                if (this.form.validation === null) {
                    this.form.validation = {password: [this.$t('password_match1')]};
                } else {
                    Object.assign(this.form.validation, {password: [this.$t('password_match1')]});
                }
                return false;
            }

            if (!match2) {
                if (this.form.validation === null) {
                    this.form.validation = {password: [this.$t('password_match2')]};
                } else {
                    Object.assign(this.form.validation, {password: [this.$t('password_match2')]});
                }
                return false;
            }

            if (!match3) {
                if (this.form.validation === null) {
                    this.form.validation = {password: [this.$t('password_match3')]};
                } else {
                    Object.assign(this.form.validation, {password: [this.$t('password_match3')]});
                }
                return false;
            }

            if (!match4) {
                if (this.form.validation === null) {
                    return this.form.validation = {password: [this.$t('password_match4')]};
                } else {
                    Object.assign(this.form.validation, {password: [this.$t('password_match4')]});
                }

                return false;
            }

            if (!match0) {
                if (this.form.validation === null) {
                    return this.form.validation = {password: [this.$t('password_minimum')]};
                } else {
                    Object.assign(this.form.validation, {password: [this.$t('password_minimum')]});
                }

                return false;
            }

            return true;
        },
    }
});

