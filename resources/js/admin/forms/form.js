Vue.component('form-form', {
    data() {
        return {
            route: 'forms',
            id: null,
            title: languages(),
            page: '',
            pages: [],
            input_field: '',
            inputFields: [],
            formInputFields: [],
            label: '',
            // radioList: [],
            // checkboxList: [],
            form: {
                validation: null,
                disabledButton: false,
                disabledAddButton: true,
                disabledDeleteButton: false,
            },
        }
    },
    props: ['pForm'],
    watch: {
        input_field: function (val) {
            this.form.disabledAddButton = !val;
        }
    },
    mounted() {
        this.getPages();
        this.getInputFields();
        if (this.pForm) {
           // console.log(this.pForm)
            this.id = this.pForm.id
            this.title = this.pForm.title
            this.page = this.pForm.page_id
            this.formInputFields = this.pForm.fields
        }
    },
    methods: {
        viewForm() {

        },
        addField() {
            let newField;

            //1:image
            //2:Text
            //3:TextArea
            if (this.input_field === 1 || this.input_field === 2 || this.input_field === 3) {
                newField = {input_field_id: this.input_field, label: this.label}
            }

            //3:Radio
            //4:Checkbox
            //5:Drop Down List
            if (this.input_field === 4 || this.input_field === 5 || this.input_field === 6) {
                newField = {input_field_id: this.input_field, label: this.label, listOfOptions: []}
            }
            this.formInputFields.push(newField);
            this.label = '';
        },
        deleteField(index, label) {
            Swal.fire({
                title: this.$t('art_you_delete', {name: label}),
                text: "",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: this.$t('no'),
                confirmButtonText: this.$t('yes'),
            }).then((result) => {
                if (result.value) {
                    Vue.delete(this.formInputFields, index);
                }
            });
        },
        deleteSubField(index, subIndex, value) {
            Swal.fire({
                title: this.$t('art_you_delete', {name: value}),
                text: "",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: this.$t('no'),
                confirmButtonText: this.$t('yes'),
            }).then((result) => {
                if (result.value) {
                    Vue.delete(this.formInputFields[index]['listOfOptions'], subIndex);
                }
            });
        },
        addSubField(index) {
            this.formInputFields[index].listOfOptions.push({value: '',});
        },
        async save() {
            this.form.disabledButton = true;
            this.form.validation = null;
            showLoading();
            await axios.post(this.$admin_url + '/' + this.route + '/store', {
                id: this.id,
                title: this.title,
                page: this.page,
                formInputFields: this.formInputFields,
            }).then(response => {
                hideLoading();
                this.form.disabledButton = false;
                swalSuccess(response.data.message);
                adminRedirectTo(this.route);
            }).catch(error => {
                hideLoading();
                this.form.disabledButton = false;
                this.form.validation = error.response.data.errors;
                swalError(error);
            })
        },
        async getPages() {
            await axios.get(this.$admin_url + '/pages/all/all',).then(response => {
                this.pages = response.data.data;
            }).catch(error => {
                swalError(error);
            })
        },
        async getInputFields() {
            await axios.get(this.$admin_url + '/forms/input-fields/all',).then(response => {
                this.inputFields = response.data.data;
            }).catch(error => {
                swalError(error);
            })
        },
    }
});
