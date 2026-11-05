<template>
    <div>
        <code>*{{ typeExtension }}</code>
        <div style="width: 233px;margin-top: 10px;">
            <input :disabled="disableLoadingButton"
                   :id="id"
                   class="inputfile"
                   type="file" v-on:change="uploadFile">

            <label :disabled="disableLoadingButton" :for="id" class="btn btn-success btn-block form-control">
                <i class="fa fa-upload"></i>
                {{placeholder}}
                <span v-if="disableLoadingButton"><i class="fa fa-spinner fa-pulse fa-fw"></i></span>
            </label>
        </div>
        <div class="form-control-feedback" v-if="validation && validation.file">{{ validation.file[0] }}</div>
        <div class="form-control-feedback" v-if="valid && valid.extensions">{{ valid.extensions }}</div>
        <div v-if="value.path">
            <a :href="value.path" target="_blank">{{ value.name }}</a>
            <button type="button" @click="deleteFile" class="btn btn-outline-danger m-btn m-btn--icon btn-sm m-btn--icon-only m-btn--pill m-btn--air" title="Delete"><i class="la la-trash"></i></button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            disableLoadingButton: false,
            validation: null,
            file: null,
            value: {
                name: null,
                path: null,
            },
            valid: {
                extensions: null,
            },
        }
    },
    props: {
        id: '',
        route: null,
        upload: '',
        typeExtension: null,
        placeholder: '',
        valueProp:null,
        resetUpload:false
    },
    watch: {
        resetUpload:function (val) {
            //   this.callRestUpload();
        },
        // valueProp:function (val) {
        //     // this.value.name = val.name;
        //     // this.value.path = val.path;
        // }
    },
    mounted() {
        if (this.valueProp) {
            setTimeout(()=>{
                this.value.name = this.valueProp.name;
                this.value.path = this.valueProp.path;
            },1000);
        }
    },
    methods: {
        uploadFile(e) {

            var file = e.target.files[0];
            var file_name = file ? file.name : '';

            var extension = file_name.substr((file_name.lastIndexOf('.') + 1)).toLowerCase();
            //console.log(extensions)
            var extensions = this.typeExtension ? this.typeExtension : ["jpg", "jpeg", "png", "pdf", "doc", 'docx','xlsx','svg'];

            if (!extensions || extensions.indexOf(extension) < 0) {
                this.valid.extensions = "Please upload extensions file  " + extensions.toString();
                return false;
            }


            var formData = new FormData();
            formData.append('file', file);
            formData.append('upload', this.upload);

            this.disableLoadingButton = true;
            this.validation = null;
            this.valid.extensions = null;

            axios.post(ROOT_URL+'/uploads/file', formData)
                .then(response => {
                    this.disableLoadingButton = false;
                    var file = {
                        path: response.data.url,
                        name: response.data.name,
                        file_link: response.data.file_link,
                    };
                    this.$emit('update:file', file);
                    this.file = file.path;
                    this.value.path = file.path;
                    this.value.name = file.name;
                })
                .catch(function (err) {
                    this.validation = err.response.data.errors;
                    this.disableLoadingButton = false;
                }.bind(this));
        },
        deleteFile() {
            Swal.fire({
                title: this.$t('art_you_delete',{name:this.placeholder }),
                text: "",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'No',
                confirmButtonText: 'Yes',
            }).then((result) => {
                if (result.value) {
                    this.callRestUpload();
                }
            });
        },
        callRestUpload() {
            this.file = null;
            this.value.name = null
            this.value.path = null
            this.$emit('update:file', {path: null, name: null, file_link: null});
        }
    }
}
</script>

<style>
.inputfile {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
}
</style>


