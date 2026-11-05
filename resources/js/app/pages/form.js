Vue.component('form-page', {
    data() {
        return {
            route: 'pages',
            formFields: [],
            checkedNames: [],
            formData: {},
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            }
        }
    },
    props: ['pFormFields','formId'],
    mounted() {

        Object.keys(this.formData).forEach((key,value) => {
            //console.log(value)
            this.formData[key]['name'] = '';
        });
    },
    created() {
        if (this.pFormFields) {
            this.loadForm();
        }
    },
    methods: {
        loadForm() {

            let name;
            this.pFormFields.forEach(field => {

                name = 'q' + field.id;

                this.formFields.push(
                    {
                        label: field.label,
                        name: name,
                        type: field.input_field_id,
                        options: field.listOfOptions
                    }
                );

                this.formData[name] = {
                    'name': field.input_field_id === 5 ? [] : '',
                    'form_field_id': field.id,
                    'input_field_id': field.input_field_id,
                };
            });
        },
        save() {
            this.form.disabledButton = true;
            this.form.loadingDisplay = true;
            this.form.validation = null;
            axios.post(this.$base_url + '/forms/store', {
                formData: this.formData,
                token: this.$token,
                formId: this.formId,
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
        resetForm() {
            this.form.loadingDisplay = false;
            this.form.disabledButton = false;
            this.form.validation = null;



        }
    }
});

