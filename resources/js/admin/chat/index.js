Vue.component('chat-index', {
    data() {
        return {
            route: 'chat',
            messages: [],
            message: '',
            userMessageId: null,
            page: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10
            },
            form: {
                validation: null,
                disabledButton: true,
                disabledButtonUpload: false,
                loadingDisplay: false,
            },
        }
    },
    props: ['orderId','userMessage'],
    mounted() {
        if(this.userMessage) {
            this.userMessageId = this.userMessage.id;
        }
        this.listenerContent();
        this.fetchMessages();


        window.Echo.private('App.User.' + this.$user.id)
            .listen('MessageSend', (e) => {
                playSound('/assets/solemn');
                this.fetchMessagesNotLoading();

                $('#messages_scroll').animate({scrollTop: 10000000000000000000000}, 100);
            });
    },

    methods: {
        fetchMessages(concat = false) {
            this.message = '';
            this.form.loadingDisplay = true;
            axios.get(this.$admin_url + '/chat/fetch-messages', {
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
        listenerContent() {
            this.dropdownContent = document.getElementById("chat-content");

            if (this.dropdownContent) {
                this.dropdownContent.addEventListener('scroll', (e) => {
                    let scrollTop = e.target.scrollTop;
                    let bottomOfWindow = scrollTop === 0;
                    if (bottomOfWindow) {
                        this.getMore();
                    } else {
                        this.bottomOfWindow = true;
                    }
                });
            }
        },
        getMore() {
            if (this.messages.length < this.page.totalItems) {
                this.page.currentPage++;
                this.fetchMessages();
            }
        },
        sendMessage() {
            this.form.disabledButton = true;
            this.form.loadingDisplay = true;
            this.form.validation = null;
            axios.post(this.$admin_url + '/chat/store', {
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
    }
});
