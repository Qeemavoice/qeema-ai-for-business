<template>
    <el-upload
        ref="upload"
        :limit="3"
        :accept="accept"
        :action="action"
        :before-remove="beforeRemove"
        :before-upload="beforeUpload"
        :file-list="fileList"
        :headers="headers"
        :on-change="handleChange"
        :on-error="handleError"
        :on-exceed="handleExceed"
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        :on-success="handleUploadSuccess"
        class="upload-demo">
        <el-button size="small" type="primary"><i class="el-icon-upload"></i> {{ $t('click_to_upload') }}</el-button>
        <div slot="tip" class="el-upload__tip">{{ tip }}</div>
    </el-upload>

</template>
<script>
export default {
    props: {
        tip: '',
        dir: '',
        _file: '',
        type: '',
    },
    data() {
        return {
            fileList: [],
            action: '',
            accept: 'image/jpeg,image/gif,image/png',
            headers: {
                'X-CSRF-TOKEN': this.$token,
            },
        };
    },
    mounted() {
        if (this.type === 'audio')
            this.accept = 'audio/mpeg,audio/mp3,audio/mpga,audio/wav,audio/aac,audio/pcm';

        this.action = ROOT_URL + '/uploads/file?dir=' + this.dir;
    },
    watch: {
        _file: function (val) {
            if (val && val.url && this.fileList.length === 0) {
                this.fileList.push(val);
            } else if (val === '' || val == null) {
                this.$refs.upload.clearFiles();
            }
        }
    },
    methods: {
        handleChange(file) {
        },
        handleRemove(file, fileList) {
            this.$emit('update:_file', null);
        },
        handlePreview(file) {
            const previewFile = file.response ? file.response.url : file.url;
            if (previewFile)
                window.open(previewFile);
        },
        handleExceed(file, fileList) {

        },
        beforeRemove(file, fileList) {
            return this.$confirm(this.$t('cancel_the_transfert_of_file_name', {file_name: file.name}), this.$t('warning'), {
                confirmButtonText: this.$t('ok'),
                cancelButtonText: this.$t('cancel'),
                type: 'warning'
            });
        },
        beforeUpload(file, fileList) {
            if (this.type === 'audio') {
                if (file.type !== 'audio/mpeg' &&
                    file.type !== 'audio/mp3' &&
                    file.type !== 'audio/mpga' &&
                    file.type !== 'audio/aac' &&
                    file.type !== 'audio/pcm' &&
                    file.type !== 'audio/wav') {
                    swalError(this.$t('upload_file_can_only_be_in_audio_format'));
                    this.$refs.upload.clearFiles();
                }
            }
        },
        handleUploadSuccess(response, file) {
            this.$refs.upload.clearFiles()
            this.fileList = [{name: response.name, url: response.url}]
            this.$emit('update:_file', response);

        },
        handleError(err, file, fileList) {
            swalError(this.$t('upload_failed'));
        }
    }
}
</script>
