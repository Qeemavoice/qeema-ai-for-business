<template>
    <span :class="'badge fw-bolder px-4 py-3 badge-light-'+color">{{ name }}</span>
</template>

<script>
export default {
    data() {
        return {
            id: null,
            name: '',
            color: '',
        }
    },
    props: {
        isActive: null
    },
    watch: {
        isActive: function (val) {
            this.changeActive();
        }
    },
    mounted() {
        this.changeActive();
    },
    methods: {
        changeActive() {
            if (this.isActive) {
                switch (this.isActive) {
                    case 1:
                        this.color = 'success'
                        this.name = this.$t('active')
                        break;
                    case 0:
                        this.color = 'danger';
                        this.name = this.$t('deactive')
                        break;
                    default:
                        this.color = 'danger';
                        this.name = this.$t('deactive')
                        break;
                }
            }
        }
    }
}
</script>

<style scoped>

</style>
