import myUpload from 'vue-image-crop-upload/upload-2.vue';

Vue.component('admin-form', {
    data() {
        return {
            route: 'admins',
            id: null,
            first_name: '',
            last_name: '',
            mobile: null,
            email: '',
            password: '',
            password_confirmation: '',
            role: '',
            image: '',
            show_image_crop_upload: false,
            headers: {
                'X-CSRF-TOKEN': this.$token,
            },
            imgDataUrl: null,
            roles: [],
            form: {
                validation: null,
                disabledButton: false,
            },
        }
    },
    components: {
        'my-upload': myUpload,
    },
    props: ['admin', 'userImageDefault'],
    mounted() {
        this.getRoles();

        if (this.userImageDefault) {
            this.imgDataUrl = this.userImageDefault;
        }

        if (this.admin) {
            this.id = this.admin.id
            this.role = this.admin.role_id
            this.first_name = this.admin.first_name
            this.last_name = this.admin.last_name
            this.mobile = this.admin.mobile
            this.email = this.admin.email
            if (this.admin.image) {
                this.image = this.admin.image
                this.imgDataUrl = this.admin.image_url
            }
        }
    },
    methods: {
        save() {
            this.form.disabledButton = true;
            this.form.validation = null;
            showLoading();
            axios.post(this.$admin_url + '/' + this.route + '/store', {
                id: this.id,
                role: this.role,
                first_name: this.first_name,
                last_name: this.last_name,
                mobile: this.mobile,
                email: this.email,
                password: this.password,
                password_confirmation: this.password_confirmation,
                personal_photo: this.image,
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
        getRoles() {
            axios.get(this.$admin_url + '/roles/all',).then(response => {
                this.roles = response.data.data;
            }).catch(error => {
                swalError(error);
            })
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
