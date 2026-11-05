import myUpload from 'vue-image-crop-upload/upload-2.vue';

Vue.component('client-profile-index', {
    data() {
        return {
            full_name: '',
            email: '',
            whatsapp_number: '',
            country: '',
            image: '',
            show_image_crop_upload: false,
            imgDataUrl: null,
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            }
        }
    },
    components: {
        'my-upload': myUpload,
    },
    props: {
        user: null,
        userImageDefault: null,
    },
    mounted() {

        if (this.user) {
            if (this.userImageDefault) {
                this.imgDataUrl = this.userImageDefault;
            }
            this.id = this.user.id;
            this.full_name = this.user.full_name;
            this.email = this.user.email;
            this.whatsapp_number = this.user.whatsapp_number;
            this.country = this.user.country;
            if (this.user.image) {
                this.image = this.user.image;
                this.imgDataUrl = this.user.image_url;
            }
        }

        // $('#modal_edit_profile').on('shown.bs.modal', (e) => {
        //     this.form.loadingDisplay = false;
        // });
    },
    methods: {
        updateProfile() {
            this.form.loadingDisplay = true;
            this.form.disabledButton = true;
            this.form.validation = null;
            axios.post(this.$base_url + '/clients/profile/update', {
                id: this.id,
                full_name: this.full_name,
                email: this.email,
                whatsapp_number: this.whatsapp_number,
                country: this.country,
                image: this.image,
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
        showEditProfileModal() {
            $('#modal_edit_profile').modal('show');
        },
        toggleShow(key = null) {
            this.show_image_crop_upload = !this.show_image_crop_upload;
        },
        cropSuccess(imgDataUrl, field) {
            console.log('-------- crop success --------');
            this.imgDataUrl = imgDataUrl;
        },
        cropUploadSuccess(jsonData, field) {
            console.log('-------- upload success --------');
            this.image = jsonData.location;
        },
        cropUploadFail(status, field) {
            console.log('-------- upload fail --------');
            swalError(status);
        },

    }
});

