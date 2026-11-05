<template>
    <div class="col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start">
        <div class="dataTables_length">
            <label>
                <select v-model="limit"class="form-select form-select-sm form-select-solid"
                        name="kt_customers_table_length" @change="onLimit">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </label>
        </div>
        <span v-if="meta&&meta.totalItems"> ( {{meta.totalItems}} ) المجموع</span>
    </div>
</template>

<script>
export default {
    data() {
        return {
            limit: 10,
        }
    },
    props:{
        meta:null,
    },
    methods: {
        onLimit() {
            // this.$emit('update:limit', this.limit);
            this.$parent.limit = this.limit;
            this.$parent.page.currentPage = 1;
            this.$parent.fetchData(this.route);
        }
    }
}
</script>
