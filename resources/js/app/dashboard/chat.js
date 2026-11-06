import {onMounted, ref} from 'vue';

Vue.component('chat-index', {
    data() {
        return {
            messages: [],
            u_to: null,
            message: '',
            bottomOfWindow: false,
            dropdownContent: null,
            form: {
                validation: null,
                disabledButton: true,
                disabledButtonUpload: false,
                loadingDisplay: false,
            },
            page: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10
            },
        }
    },
    props: {
        orderId: null,
        userMessageId: null,
        fromUser: null,
        toUser: null,
    },
    mounted() {

        this.listenerContent();
        this.fetchMessages();

        window.Echo.private('App.User.' + this.$user.id)
            .listen('MessageSend', (e) => {
                this.userMessageId = e.message.user_message_id;
                playSound('/assets/solemn');
                this.fetchMessagesNotLoading();
            });

    },
    methods: {
        uploadMultiFiles(e) {
            if (e.target.files.length > 0) {
                _.each(e.target.files, function (file) {
                    let file_name = file ? file.name : '';

                    let extension = file_name.substr((file_name.lastIndexOf('.') + 1)).toLowerCase();
                    let extensions = this.typeExtension ? this.typeExtension : ["jpg", "jpeg", "png", "pdf", "doc", 'docx', 'xlsx', 'svg', 'mp3', 'mp4', 'm4a'];

                    if (!extensions || extensions.indexOf(extension) < 0) {
                        let message = "Please upload extensions file  " + extensions.toString();
                        toastError(message);
                        return false;
                    }

                    let formData = new FormData();
                    formData.append('file', file);

                    this.form.disabledButtonUpload = true;
                    axios.post(this.$root_url + '/uploads/file', formData)
                        .then(response => {
                            this.form.disabledButtonUpload = false;
                            let file = response.data;
                            this.form.message = null;
                        })
                        .catch((err) => {
                            this.form.message = err.response.data.message;
                            this.form.disabledButtonUpload = false;
                        });

                }.bind(this))
            }

        },
        sendMessage() {
            this.form.disabledButton = true;
            this.form.loadingDisplay = true;
            this.form.validation = null;
            axios.post(this.$base_url + '/chat/store', {
                userMessageId: this.userMessageId,
                contentMessage: this.message,
                orderId: this.orderId,
            }).then(response => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                this.message = '';
                this.fetchMessagesNotLoading();
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                //console.log(error)
            })
        },

        fetchMessagesNotLoading() {
            this.message = '';
            this.page.currentPage = 1;
            axios.get(this.$base_url + '/chat/fetch-messages', {
                params: {
                    page: this.page.currentPage,
                    orderId: this.orderId,
                    userMessageId: this.userMessageId,
                }
            }).then(response => {
                if (this.page.currentPage === 1) {
                    this.messages.totalItems = response.data.data.meta.total;
                    this.messages = (response.data.data.data).reverse();
                }
            }).catch(error => {
                //console.log(error);
            });
        },
        fetchMessages(concat = false) {
            this.message = '';
            this.form.loadingDisplay = true;
            axios.get(this.$base_url + '/chat/fetch-messages', {
                params: {
                    page: this.page.currentPage,
                    orderId: this.orderId,
                    userMessageId: this.userMessageId,
                }
            }).then(response => {

                if (this.page.currentPage === 1) {

                    this.listenerContent();
                    this.page.totalItems = response.data.data.meta.total;
                    this.messages = (response.data.data.data).reverse();
                    $('#chat-content').animate({scrollTop: this.dropdownContent.scrollHeight + 300}, 50);

                } else if (concat) {
                    this.messages = [].concat(this.messages, response.data.data);
                    $('#chat-content').animate({scrollTop: this.dropdownContent.scrollHeight + 300}, 50);
                } else {
                    $.each(response.data.data, (key, value) => {
                        this.messages.unshift(value);
                    });
                    $('#chat-content').animate({scrollTop: 50}, 50);
                }
                this.form.loadingDisplay = false;
            }).catch(error => {
                this.form.loadingDisplay = false;
                //console.log(error);
            });
        },
        getMore() {
            if (this.messages.length < this.page.totalItems) {
                this.page.currentPage++;
                this.fetchMessages();
            }
        },
        listenerContent() {
            let ths = this;
            this.dropdownContent = document.getElementById("chat-content");

            if (this.dropdownContent) {
                this.dropdownContent.addEventListener('scroll', function (e) {
                    let scrollTop = e.target.scrollTop;
                    //console.log(scrollTop)
                    let bottomOfWindow = scrollTop === 0;
                    if (bottomOfWindow) {
                        ths.getMore();
                    } else {
                        this.bottomOfWindow = true;
                    }
                });
            }
        },
        // async loadMessages(page = 1) {
        //     this.isLoading = true;
        //     try {
        //         // استدعاء API لجلب الرسائل
        //         const response = await fetch(`/api/messages?page=${page}`);
        //         const data = await response.json();
        //         if (data.messages.length > 0) {
        //             // دمج الرسائل القديمة مع الحالية
        //             this.messages = [...data.messages, ...this.messages];
        //         } else {
        //             this.hasMoreMessages = false; // لا توجد المزيد من الرسائل
        //         }
        //     } catch (error) {
        //         console.error("Error loading messages:", error);
        //     } finally {
        //         this.isLoading = false;
        //     }
        // },
        // async handleScroll() {
        //     const container = this.$refs.chatContainer;
        //
        //     // التحقق إذا كان المستخدم وصل إلى أعلى منطقة التمرير
        //     if (container.scrollTop === 0 && this.hasMoreMessages && !this.isLoading) {
        //         this.currentPage++;
        //         await this.loadMessages(this.currentPage);
        //
        //         // الحفاظ على موضع التمرير
        //         this.$nextTick(() => {
        //             container.scrollTop = 1;
        //         });
        //     }
        // },
        async handleScroll() {

        }
    }
});

