Vue.component('work-fields-index', {
    data() {
        return {
            work_field: '',
            work_fields: [],
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            }
        }
    },
    props: {
        workFields: null,
        workField: null,
    },
    mounted() {
        if (this.workFields) {
            $.each(this.workFields, (key, value) => {
                this.checkedWorkField(value)
            });
        }
        if (this.workField) {
            this.checkedOtherWorkField();
            this.work_field = this.workField;
        }
    },
    methods: {
        update() {
            this.form.loadingDisplay = true;
            this.form.disabledButton = true;
            this.form.validation = null;
            axios.post(this.$base_url + '/clients/work-fields/update', {
                work_fields: this.work_fields,
                work_field: this.work_field,
            }).then(response => {
                this.form.loadingDisplay = false;
                this.form.disabledButton = false;
                this.form.validation = null;
                toastSuccess();
                $('#modal_edit_profile').modal('hide');
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                this.form.validation = error.response.data.errors;
                toastError(error);
            })
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
    }
});

