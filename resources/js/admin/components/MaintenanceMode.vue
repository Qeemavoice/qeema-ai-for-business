<template>
    <label class="form-check form-switch form-check-custom form-check-solid pulse pulse-success" for="maintenance_mode">
        <input id="maintenance_mode" v-model="maintenance_mode" class="form-check-input w-30px h-20px" type="checkbox" @change="onMaintenance"/>
        <span class="pulse-ring ms-n1"></span>
        <span class="form-check-label text-gray-600 fs-7">{{$t('maintenance_mode')}}</span>
    </label>
</template>

<script>
export default {
    data() {
        return {
            route: 'settings/maintenance-mode',
            maintenance_mode: false,
        }
    },
    props: ['maintenanceMode'],
    mounted() {
        if (this.maintenanceMode) {
            this.maintenance_mode = this.maintenanceMode
        }
    },
    methods: {
        onMaintenance() {
            Swal.fire({
                title: this.$t('are_you_sure_about_this_procedure', {name: name}),
                //  text: this.$t('you_wont_be_able_to_revert_this'),
                icon: "warning",
                confirmButtonColor: '#F64E60',
                showCancelButton: true,
                confirmButtonText: this.$t('yes_definitely'),
                cancelButtonText: this.$t('cancel')
            }).then((result) => {
                if (result.value) {
                    showLoading();
                    axios.post(this.$admin_url + '/' + this.route + '/store', {
                        key: 'maintenance_mode',
                        value: this.maintenance_mode,
                    }).then(response => {
                        swalSuccess(response.data.message);
                        hideLoading();
                    }).catch(error => {
                        swalError(error);
                        hideLoading();
                    })
                }
            });
        }
    }
}
</script>
