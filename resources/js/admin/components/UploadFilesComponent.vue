<template>
  <div v-if="multi">
    <label :id="divId" class="custom-file-upload">
      <input :id="id" :disabled="form.disabledButton" class="flex-grow-1" multiple type="file" v-on:change="uploadMultiFiles"/>
      <span class="placeholder-input">{{ localPlaceholder }}</span>
      <span class="btn"><i id="upload-loading" class="spinner-border" style="display: none;"></i> <abbr>{{ $t('upload') }}</abbr></span>
      <span v-if="form.message" class="error-block">{{ form.message }}</span>
    </label>
    <div v-if="files&&files.length > 0" class="file-list">
      <ul class="list-unstyled p-0">
        <li v-for="(file,index) in files" class="d-flex align-items-center">
          <figure class="flex-shrink-0">
            <img :src="file.url" alt="" class="cover-image"/>
          </figure>
          <div class="flex-grow-1 ms-3">{{ file.name }}</div>
          <button class="btn flex-shrink-0" type="button" @click="removeFile(index)">
            <svg fill="none" height="12" viewBox="0 0 12 12" width="12" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.5563 1.65683L7.31371 5.89948L11.5563 10.1421L10.1421 11.5563L5.89949 7.31369L1.65685 11.5563L0.242641 10.1421L4.48528 5.89948L0.242641 1.65683L1.65685 0.242621L5.89949 4.48526L10.1421 0.242621L11.5563 1.65683Z" fill="black"/>
            </svg>
          </button>
        </li>
      </ul>
    </div>
  </div>

  <div v-else>
    <label :id="divId" class="custom-file-upload">
      <input :id="id" :disabled="form.disabledButton" class="flex-grow-1" type="file" v-on:change="uploadFile"/>
      <span class="placeholder-input">{{ localPlaceholder }}</span>
      <span class="btn"><i id="upload-loading" class="spinner-border" style="display: none;"></i> <abbr>{{ $t('upload') }}</abbr></span>
    </label>

    <span v-if="form.message" class="error-block">{{ form.message }}</span>
    <div v-if="file&&file.url" class="file-list">
      <ul class="list-unstyled p-0">
        <li class="d-flex align-items-center">
          <figure class="flex-shrink-0">
            <a v-if="file_type === 'image'" :href="file.url" target="_blank">
              <img :src="file.url" alt="" class="cover-image"/>
            </a>

            <a v-else :href="file.url" target="_blank">
              <svg fill="none" height="34" viewBox="0 0 34 34" width="34" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_224_17131)">
                  <path d="M11.8438 15.3125C11.5702 15.3125 11.3079 15.4211 11.1145 15.6145C10.9211 15.8079 10.8125 16.0702 10.8125 16.3438C10.8125 16.6173 10.9211 16.8796 11.1145 17.073C11.3079 17.2664 11.5702 17.375 11.8438 17.375H22.1562C22.4298 17.375 22.6921 17.2664 22.8855 17.073C23.0789 16.8796 23.1875 16.6173 23.1875 16.3438C23.1875 16.0702 23.0789 15.8079 22.8855 15.6145C22.6921 15.4211 22.4298 15.3125 22.1562 15.3125H11.8438ZM10.8125 20.4688C10.8125 20.1952 10.9211 19.9329 11.1145 19.7395C11.3079 19.5461 11.5702 19.4375 11.8438 19.4375H22.1562C22.4298 19.4375 22.6921 19.5461 22.8855 19.7395C23.0789 19.9329 23.1875 20.1952 23.1875 20.4688C23.1875 20.7423 23.0789 21.0046 22.8855 21.198C22.6921 21.3914 22.4298 21.5 22.1562 21.5H11.8438C11.5702 21.5 11.3079 21.3914 11.1145 21.198C10.9211 21.0046 10.8125 20.7423 10.8125 20.4688ZM10.8125 24.5938C10.8125 24.3202 10.9211 24.0579 11.1145 23.8645C11.3079 23.6711 11.5702 23.5625 11.8438 23.5625H15.9688C16.2423 23.5625 16.5046 23.6711 16.698 23.8645C16.8914 24.0579 17 24.3202 17 24.5938C17 24.8673 16.8914 25.1296 16.698 25.323C16.5046 25.5164 16.2423 25.625 15.9688 25.625H11.8438C11.5702 25.625 11.3079 25.5164 11.1145 25.323C10.9211 25.1296 10.8125 24.8673 10.8125 24.5938Z" fill="#8B734B"></path>
                  <path d="M20.0938 0.875H8.75C7.65598 0.875 6.60677 1.3096 5.83318 2.08318C5.0596 2.85677 4.625 3.90598 4.625 5V29.75C4.625 30.844 5.0596 31.8932 5.83318 32.6668C6.60677 33.4404 7.65598 33.875 8.75 33.875H25.25C26.344 33.875 27.3932 33.4404 28.1668 32.6668C28.9404 31.8932 29.375 30.844 29.375 29.75V10.1562L20.0938 0.875ZM20.0938 2.9375V7.0625C20.0938 7.88301 20.4197 8.66992 20.9999 9.25011C21.5801 9.8303 22.367 10.1562 23.1875 10.1562H27.3125V29.75C27.3125 30.297 27.0952 30.8216 26.7084 31.2084C26.3216 31.5952 25.797 31.8125 25.25 31.8125H8.75C8.20299 31.8125 7.67839 31.5952 7.29159 31.2084C6.9048 30.8216 6.6875 30.297 6.6875 29.75V5C6.6875 4.45299 6.9048 3.92839 7.29159 3.54159C7.67839 3.1548 8.20299 2.9375 8.75 2.9375H20.0938Z" fill="#8B734B"></path>
                </g>
                <defs>
                  <clipPath id="clip0_224_17131">
                    <rect fill="white" height="33" transform="translate(0.5 0.875)" width="33"></rect>
                  </clipPath>
                </defs>
              </svg>
            </a>

            <!--                      <a v-if="/^image\//.test(file.mimeType)" :href="file.url" target="_blank">-->
            <!--                        <img :src="file.url" alt="" class="cover-image"/>-->
            <!--                      </a>-->
            <!--                      <a v-else="" :href="file.url" target="_blank">-->
            <!--                        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_224_17131)"><path d="M11.8438 15.3125C11.5702 15.3125 11.3079 15.4211 11.1145 15.6145C10.9211 15.8079 10.8125 16.0702 10.8125 16.3438C10.8125 16.6173 10.9211 16.8796 11.1145 17.073C11.3079 17.2664 11.5702 17.375 11.8438 17.375H22.1562C22.4298 17.375 22.6921 17.2664 22.8855 17.073C23.0789 16.8796 23.1875 16.6173 23.1875 16.3438C23.1875 16.0702 23.0789 15.8079 22.8855 15.6145C22.6921 15.4211 22.4298 15.3125 22.1562 15.3125H11.8438ZM10.8125 20.4688C10.8125 20.1952 10.9211 19.9329 11.1145 19.7395C11.3079 19.5461 11.5702 19.4375 11.8438 19.4375H22.1562C22.4298 19.4375 22.6921 19.5461 22.8855 19.7395C23.0789 19.9329 23.1875 20.1952 23.1875 20.4688C23.1875 20.7423 23.0789 21.0046 22.8855 21.198C22.6921 21.3914 22.4298 21.5 22.1562 21.5H11.8438C11.5702 21.5 11.3079 21.3914 11.1145 21.198C10.9211 21.0046 10.8125 20.7423 10.8125 20.4688ZM10.8125 24.5938C10.8125 24.3202 10.9211 24.0579 11.1145 23.8645C11.3079 23.6711 11.5702 23.5625 11.8438 23.5625H15.9688C16.2423 23.5625 16.5046 23.6711 16.698 23.8645C16.8914 24.0579 17 24.3202 17 24.5938C17 24.8673 16.8914 25.1296 16.698 25.323C16.5046 25.5164 16.2423 25.625 15.9688 25.625H11.8438C11.5702 25.625 11.3079 25.5164 11.1145 25.323C10.9211 25.1296 10.8125 24.8673 10.8125 24.5938Z" fill="#8B734B"></path> <path d="M20.0938 0.875H8.75C7.65598 0.875 6.60677 1.3096 5.83318 2.08318C5.0596 2.85677 4.625 3.90598 4.625 5V29.75C4.625 30.844 5.0596 31.8932 5.83318 32.6668C6.60677 33.4404 7.65598 33.875 8.75 33.875H25.25C26.344 33.875 27.3932 33.4404 28.1668 32.6668C28.9404 31.8932 29.375 30.844 29.375 29.75V10.1562L20.0938 0.875ZM20.0938 2.9375V7.0625C20.0938 7.88301 20.4197 8.66992 20.9999 9.25011C21.5801 9.8303 22.367 10.1562 23.1875 10.1562H27.3125V29.75C27.3125 30.297 27.0952 30.8216 26.7084 31.2084C26.3216 31.5952 25.797 31.8125 25.25 31.8125H8.75C8.20299 31.8125 7.67839 31.5952 7.29159 31.2084C6.9048 30.8216 6.6875 30.297 6.6875 29.75V5C6.6875 4.45299 6.9048 3.92839 7.29159 3.54159C7.67839 3.1548 8.20299 2.9375 8.75 2.9375H20.0938Z" fill="#8B734B"></path></g> <defs><clipPath id="clip0_224_17131"><rect width="33" height="33" fill="white" transform="translate(0.5 0.875)"></rect></clipPath></defs></svg>-->
            <!--                      </a>-->

          </figure>
          <div class="flex-grow-1 ms-3">{{ file.name }}</div>
          <button class="btn flex-shrink-0" type="button" @click="callRestUpload">
            <svg fill="none" height="12" viewBox="0 0 12 12" width="12" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.5563 1.65683L7.31371 5.89948L11.5563 10.1421L10.1421 11.5563L5.89949 7.31369L1.65685 11.5563L0.242641 10.1421L4.48528 5.89948L0.242641 1.65683L1.65685 0.242621L5.89949 4.48526L10.1421 0.242621L11.5563 1.65683Z" fill="black"/>
            </svg>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
    data() {
        return {
            localPlaceholder: '',
            file: {
                name: null,
                url: null,
            },
            files: [],
            form: {
                message: null,
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            }
        }
    },
    props: {
        id: null,
        divId: null,
        typeExtension: null,
        placeholder: '',
        multi: {
            type: Boolean,
            default: false
        },

        // can_upload_file: {
        //     type: Boolean,
        //     default: false
        //   },

        file_type: {
            type: String,
            default: 'image'
        },
        dir:'',
        _file: '',
    },
    watch: {
        _file: function (value) {
            if (value) {
                if (Array.isArray(value)) {
                    this.files = value
                } else {
                    this.file.name = value.name ? value.name : (value.updated_file ? value.updated_file : value);
                    this.file.url = value.url ? value.url : value;
                }
            } else {
                this.file = {
                    name: null,
                    url: null,
                }
            }
        }
    },
    mounted() {
        if (this._file) {
            if (Array.isArray(this._file)) {
               // console.log('arr')
                this.files = this._file
            } else {
                this.file = {
                    name: this._file.name,
                    url: this._file.url,
                }
            }
        }
        if (this.placeholder)
            this.localPlaceholder = this.placeholder;
        else
            this.localPlaceholder = this.$t('upload_file');

    },
    methods: {

        uploadMultiFiles(e) {
            if (e.target.files.length > 0) {
                _.each(e.target.files, function (file) {
                    let file_name = file ? file.name : '';

                    let extension = file_name.substr((file_name.lastIndexOf('.') + 1)).toLowerCase();
                    let extensions = this.typeExtension ? this.typeExtension : ["jpg", "jpeg", "png", "pdf", "doc", 'docx', 'xlsx', 'svg'];

                    if (!extensions || extensions.indexOf(extension) < 0) {
                        this.form.message = "Please upload extensions file  " + extensions.toString();
                        return false;
                    }


                    let formData = new FormData();
                    formData.append('file', file);
                   // formData.append('dir', this.dir);

                    this.form.disabledButton = true;
                    this.form.validation = null;
                    this.form.message = null;
                    this.setDisplayLoadingButton(true);

                    axios.post(this.$root_url + '/uploads/file', formData)
                        .then(response => {
                            this.form.disabledButton = false;
                            let file = response.data;
                            // this.files.push(file);
                            this.form.message = null;
                            this.setPlaceholder(`uploaded ${this.files.length} files`)
                            this.$emit('update:files', file);
                            this.setDisplayLoadingButton(false);
                        })
                        .catch((err) => {
                            this.setDisplayLoadingButton(false);
                            this.form.message = err.response.data.message;
                            this.form.disabledButton = false;
                        });

                }.bind(this))
            }

        },

        uploadFile(e) {
            let file = e.target.files[0];
            let file_name = file ? file.name : '';

            let extension = file_name.substr((file_name.lastIndexOf('.') + 1)).toLowerCase();
            let extensions = this.typeExtension ? this.typeExtension : ["jpg", "jpeg", "png", "pdf", "doc", 'docx', 'xlsx', 'svg'];

            let documents_extensions = ['pdf', 'doc', 'docx'];
            let video_extensions = ['x-flv', 'mp4', 'x-mpegURL', 'MP2T', '3gpp', 'quicktime', 'x-msvideo', 'x-ms-wmv'];
            let audio_extensions = ['mpeg', 'mp3', 'mpga', 'wav','aac','pcm'];

            // if(!this.can_upload_file) {
            //   if (!extensions || extensions.indexOf(extension) < 0) {
            //       this.form.message = "Please upload extensions file  " + extensions.toString();
            //       return false;
            //   }
            // }

            if (this.file_type == 'image') {
                if (!extensions || extensions.indexOf(extension) < 0) {
                    this.form.message = "Please upload extensions file  " + extensions.toString();
                    return false;
                }
            } else if (this.file_type == 'documents') {
                if (!documents_extensions || documents_extensions.indexOf(extension) < 0) {
                    this.form.message = "Please upload extensions file  " + documents_extensions.toString();
                    return false;
                }
            } else if (this.file_type == 'video') {
                if (!video_extensions || video_extensions.indexOf(extension) < 0) {
                    this.form.message = "Please upload extensions file  " + video_extensions.toString();
                    return false;
                }
            }else if (this.file_type == 'audio') {
                if (!audio_extensions || audio_extensions.indexOf(extension) < 0) {
                    this.form.message = "Please upload extensions file  " + audio_extensions.toString();
                    return false;
                }
            }


            let formData = new FormData();
            formData.append('file', file);
            formData.append('file_type', this.file_type);
            formData.append('dir', this.dir);
            // formData.append('can_upload_file', this.can_upload_file);

            this.form.disabledButton = true;
            this.form.validation = null;
            this.form.message = null;
            this.setDisplayLoadingButton(true);

            axios.post(ROOT_URL + '/uploads/file', formData)
                .then(response => {
                    this.form.disabledButton = false;
                    let file = response.data;
                    this.file = file;
                    this.setPlaceholder(file.name)
                    this.$emit('update:_file', file);
                    this.setDisplayLoadingButton(false);
                })
                .catch((err) => {
                    this.setDisplayLoadingButton(false);
                    this.form.message = err.response.data.message;
                    this.form.disabledButton = false;
                });
        },
        deleteFile() {
            Swal.fire({
                title: this.$t('art_you_delete', {name: this.placeholder}),
                text: "",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: this.$t('no'),
                confirmButtonText: this.$t('yes'),
            }).then((result) => {
                if (result.value) {
                    this.callRestUpload();
                }
            });
        },
        callRestUpload() {
            this.file = null;
            this.setPlaceholder(this.$t('upload_file'));
            this.$emit('update:file', null);
        },

        setPlaceholder(text) {
            $('#' + this.divId + ' .file-upload-input').attr('placeholder', text)
        },
        setDisplayLoadingButton(display = false) {
            // $('#' + this.divId + ' #upload-loading').css('display', display === true ? 'block' : 'none');
            $('#' + this.divId + ' #upload-loading').css('display', display === true ? 'block' : 'none');
            $('#' + this.divId + ' span.btn abbr').css('display', !display === true ? 'block' : 'none');
        },
        removeFile(index) {
            this.files.splice(index, 1);
            this.setPlaceholder(`uploaded ${this.files.length} files`)
        }
    }
}
</script>

<style scoped>

.custom-file-upload {
    display: block;
    width: 100%;
    font-size: 16px;
    border-radius: 8px;
    height: 42px;
    border: transparent;
    position: relative;
    font-style: normal;
    font-weight: 400;
    background-color: #f5f8fa;
}

.custom-file-upload input[type=file] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
}

.placeholder-input {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    color: #AEABAB;
    position: absolute;
    top: 50%;
    left: 15px;
    transform: translateY(-50%);
}

.custom-file-upload span.btn {
    position: absolute;
    top: 6px;
    right: 15px;
}

.file-upload-button, .custom-file-upload span.btn {
    margin-left: 10px;
    background: #e4e6ef;
    border-radius: 66px;
    padding: 10px 16px !important;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 10px;
    color: #000000;
}

.spinner-border {
    width: 12px;
    height: 12px;
}

.file-list {
    margin-top: 15px;
}

.file-list li figure {
    border-radius: 6px;
    width: 38px;
    height: 38px;
    overflow: hidden;
    margin-bottom: 0;
}

.cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    vertical-align: baseline;
}
</style>


