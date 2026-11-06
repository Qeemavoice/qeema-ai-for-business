Vue.component('file-modal', {
    data() {
        return {
            email: '',
            isShow: false,
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            }
        }
    },
    props: {
        file: null,
    },
    mounted() {
        if(this.file.is_show) {
            $('#modal_file').modal('toggle');
        }
    },
    methods: {
        downloadFile(){
            this.form.disabledButton = true;
            this.form.validation = null;
            axios.post(this.$base_url + '/download-file', {
                email: this.email,
                responseType: "blob",
            }).then(response => {
                toastSuccess();
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                this.resetForm();

            }).catch(error => {

                if(error.message === 'Network Error') {
                    toastSuccess();
                    this.form.disabledButton = false;
                    this.form.loadingDisplay = false;
                    this.resetForm();
                    $('#modal_file').modal('hide');
                }
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                this.form.validation = error.response.data.errors;
                toastError(error);
            })
        },
        resetForm() {
            this.email = '';
        },
    }
});

