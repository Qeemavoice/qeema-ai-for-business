<template>
    <span class="badge badge-primary fw-bolder me-auto">{{name}}</span>
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
        type: null
    },
    watch: {
        type: function (val) {
            this.changeColor();
        }
    },
    mounted() {
        this.changeColor();
    },
    methods: {
        changeColor() {
            if (this.type) {
                this.id = this.type.id;
                this.name = typeof this.type.name === 'object' ? this.type.name[this.$lang] : this.type.name;

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
                }
            }
        }
    }
}
</script>

<style scoped>

</style>
