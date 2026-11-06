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
                        this.color = 'default'
                        break;
                    case 2:
                        this.color = 'warning';
                        break;
                    case 3:
                        this.color = 'info';
                        break;
                    case 4:
                        this.color = 'primary';
                        break;
                    case 5:
                        this.color = 'success';
                        break;
                    case 6:
                        this.color = 'danger';
                        break;
                    case 7:
                        this.color = 'dark';
                        break;
                    case 8:
                        this.color = 'danger';
                        break;
                    case 9:
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
