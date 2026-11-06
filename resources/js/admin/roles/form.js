Vue.component('role-form', {
    data() {
        return {
            route:'roles',
            id: null,
            name: languages(),
            allPermissions: [],
            checkedPermissions: [],
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            },
        }
    },
    props : ['role'],
    mounted() {
        this.getAllPermissions();

        if (this.role) {
            this.id = this.role.id;
            this.name = this.role.name;

            _.forEach(this.role.permissions, (query) => {
                this.checkedPermissions.push(query.id);
            });
        }
    },
    methods: {
        async getAllPermissions() {
            await axios.get(this.$admin_url + '/permissions/all').then(response => {
                this.allPermissions = _.groupBy(response.data.data, "group_name");
            });
        },
        save() {
            this.form.disabledButton = true;
            this.form.loadingDisplay = true;
            this.form.validation = null;
            showLoading();
            axios.post(this.$admin_url + '/' + this.route + '/store', {
                id: this.id,
                name: this.name,
                permissions: this.checkedPermissions,
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
        cancel() {
            Swal.fire({
                title: this.$t('art_you_close', {name: name}),
                text: this.$t('you_wont_be_able_to_revert_this'),
                icon: "warning",
                confirmButtonColor: '#f64e60',
                showCancelButton: true,
                confirmButtonText: this.$t('yes_it'),
                cancelButtonText: this.$t('cancel')
            }).then((result) => {
                if (result.value) {
                    adminRedirectTo(this.route);
                }
            });
        },
    }
});
