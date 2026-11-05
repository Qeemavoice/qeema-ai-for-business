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
        status: null
    },
    watch: {
        status: function (val) {
            this.changeStatus();
        }
    },
    mounted() {
        this.changeStatus();
    },
    methods: {
        changeStatus() {
            if (this.status) {
                this.id = this.status.id;
                this.name = typeof this.status.name === 'object' ? this.status.name[this.$lang] : this.status.name;

                switch (this.id) {
                    case 1:
                        this.color = 'success'
                        break;
                    case 2:
                        this.color = 'danger';
                        break;
                }
            }
        }
    }
}
</script>

<style scoped>

</style>
