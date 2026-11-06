Vue.component('chat-index', {
    data() {
        return {
            route: 'chat',
            students: [],
            messages: [],
            chat_details: '',
            message: '',
            page: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10
            },
            page1: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10
            },
            filter: {
                completeCourse: false,
            },
            ADMIN_URL: ADMIN_URL,
            LANG: LANG,
            USER: USER,

            showChat: false,
            student: '',
        }
    },

    props: ['course'],

    mounted() {
        this.getStudents();

        this.listenerContent();
        // this.fetchStudents();
        window.Echo.private('App.User.' + USER.id)
            .listen('MessageSend', (e) => {
                if (e) {
                    this.messages.push(e.message)
                    $('#messages_scroll').animate({scrollTop: 10000000000000000000000}, 100);
                }
            });
    },

    methods: {
        filterStudents(event) {
            this.getStudents();
        },
        changeStatus(order_course_id) {
            axios.post(ADMIN_URL + '/' + 'courses/' + order_course_id + '/change-order-course-status', {}).then(response => {
                swalSuccess(response.data.message);
                this.getStudents();
            }).catch(error => {
                swalError(error);
            })
        },
        getStudents() {
            showLoading();
            axios.get(ADMIN_URL + '/courses/students/data', {
                params: {
                    page: this.page1.currentPage,
                    filter: this.filter,
                    limit: this.limit,
                    courseId: this.course.id,
                }
            }).then(response => {
                hideLoading();
                this.students = response.data.data;
                this.page1.totalPages = response.data.data.meta.last_page;
                this.page1.totalItems = response.data.data.meta.total;
            }).catch(error => {
                hideLoading();
            });
        },
        listenerContent() {
            let dropdownContent = document.getElementById("messages_scroll");
            if (dropdownContent) {
                dropdownContent.addEventListener('scroll', e => {
                    let scrollTop = e.target.scrollTop;
                    if (scrollTop === 0) {
                        this.loadMore();
                    }
                });
            }
        },
        async loadMore() {
            if (this.messages.length < this.page.totalItems) {
                showLoading();
                this.page.currentPage++;
                await axios.get(`${ADMIN_URL}/${this.route}/fetch-messages`, {
                    params: {
                        page: this.page.currentPage,
                        student_id: this.student.id,
                        course_id: this.course.id,
                    }
                }).then(response => {
                    _.each(response.data.data.data, message => {
                        this.messages.unshift(message)
                    });
                    $('#messages_scroll').animate({scrollTop: 50}, 100);
                    hideLoading()
                }).catch(error => {
                    hideLoading();
                });
            }
        },

        // async fetchStudents() {
        //     showLoading();
        //     await axios.get(ADMIN_URL + "/" + this.route + '/fetch-students', {
        //         params: {
        //             // page: this.page.currentPage,
        //         }
        //     }).then(response => {
        //         hideLoading();
        //         this.students = response.data.data.data;
        //         // this.page.totalPages = response.data.data.meta.last_page;
        //         // this.page.totalItems = response.data.data.meta.total;
        //     }).catch(error => {
        //         hideLoading();
        //     });
        // },

        // async fetchMessages(chat_details) {
        //     this.chat_details = chat_details
        //     showLoading();
        //     await axios.get(ADMIN_URL + "/" + this.route + '/fetch-messages', {
        //         params: {
        //             user_message_id: chat_details.id,
        //         }
        //     }).then(response => {
        //         console.log(response.data.data.data)
        //         hideLoading();
        //         this.messages = response.data.data.data;
        //     }).catch(error => {
        //         hideLoading();
        //     });
        //
        //     $('#messages_scroll').animate({scrollTop: 10000000000000000000000},100);
        // },

        sendMessage() {
            // this.form.disabledButton = true;
            // this.form.validation = null;
            axios.post(ADMIN_URL + '/' + this.route + '/send-message', {
                student_id: this.student.id,
                course_id: this.course.id,
                message: this.message
            }).then(response => {
                this.messages.push(response.data.data)
                this.message = ''
                $('#messages_scroll').animate({scrollTop: 10000000000000000000000}, 100);
            }).catch(error => {
                // this.form.disabledButton = false;
                // this.form.validation = error.response.data.errors;
            })
        },

        async showDrawer(student) {
            this.showChat = true;
            this.student = student

            $('#kt_drawer_chat').addClass('drawer-on')
            showLoading();
            await axios.get(ADMIN_URL + "/" + this.route + '/fetch-messages', {
                params: {
                    page: this.page.currentPage,
                    student_id: student.id,
                    course_id: this.course.id,
                }
            }).then(response => {
                hideLoading();
                $('#messages_scroll').animate({scrollTop: 10000000000000000000000}, 100);
                this.messages = response.data.data.data;
                this.page.totalPages = response.data.data.meta.last_page;
                this.page.totalItems = response.data.data.meta.total;
            }).catch(error => {
                hideLoading();
            });

        }
    }
});
