Vue.component('career-form', {
    data() {
        return {
            route: 'careers',
            id: null,
            title: languages(),
            job_title: languages(),
            experience: languages(),
            responsibilities: languages(),
            tasks: languages(),
            min_salary: '',
            max_salary: '',
            external_image: null,
            interior_image: null,
            workplace_type: '',
            job_type: '',
            form: {
                validation: null,
                disabledButton: false,
            },
            LANGUAGES: JSON.parse(LANGUAGES),
        }
    },
    props: ['job'],
    mounted() {
        if (this.job) {
            this.id = this.job.id
            this.title = this.job.title
            this.job_title = this.job.job_title
            this.experience = this.job.experience
            this.responsibilities = this.job.responsibilities
            this.tasks = this.job.tasks
            this.min_salary = this.job.min_salary
            this.max_salary = this.job.max_salary
            if (this.job.external_image) {
                this.external_image = {
                    name: this.job.external_image,
                    url: this.job.external_image_url,
                }
            }
            if (this.job.interior_image) {
                this.interior_image = {
                    name: this.job.interior_image,
                    url: this.job.interior_image_url,
                }
            }
            this.workplace_type = this.job.workplace_type
            this.job_type = this.job.type
        }
    },
    methods: {
        save() {
            this.form.disabledButton = true;
            this.form.validation = null;
            showLoading();
            axios.post(this.$admin_url + '/' + this.route + '/store', {
                id: this.id,
                title: this.title,
                job_title: this.job_title,
                experience: this.experience,
                responsibilities: this.responsibilities,
                tasks: this.tasks,
                min_salary: this.min_salary,
                max_salary: this.max_salary,
                external_image: this.setExternalImage(),
                interior_image: this.setInteriorImage(),
                workplace_type: this.workplace_type,
                job_type: this.job_type,
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
        setInteriorImage() {
            return this.interior_image && this.interior_image.file_link ? this.interior_image.file_link : (this.interior_image && this.interior_image.url ? this.interior_image.name : this.interior_image);
        },
        setExternalImage() {
            return this.external_image && this.external_image.file_link ? this.external_image.file_link : (this.external_image && this.external_image.url ? this.external_image.name : this.external_image);
        },
    }
});
