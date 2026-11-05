<template>
    <a onclick="navTabList('notifications')" id="read_notifications" class="position-relative" :href="route" title="الإشعارات">
        <span class="badge badge-danger badge-nav badge-notification">{{count_notification_badge}}</span><span class="nav-icon"><i
        class="fas fa-bell"></i></span>
    </a>
</template>
<script>
export default {
    data() {
        return {
            route:'',
            count_notification_badge:0,
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            }
        }
    },
    props: {},
    watch: {},
    mounted() {
        if (this.$user && this.$user.user_type_id === this.$user_type_client) {
            this.route = this.$base_url + '/clients/profile#notifications';
        }
        if (this.$user && this.$user.user_type_id === this.$user_type_voice_actor) {
            this.route = this.$base_url + '/voice-actors/profile#notifications';
        }
        this.getTheNumberOfUnreadMessages();

        Notification.requestPermission().then(permission=> {
            console.log(permission);
        });


        window.Echo.private('App.User.' + this.$user.id)
            .notification((notification) => {
                playSound('/asset/solemn');

                this.count_notification_badge = this.count_notification_badge + 1;

                let _notification = new Notification(removeTags(notification.title[this.$lang]), {
                    body: removeTags(notification.body[this.$lang]),
                    icon: notification.icon,
                });

                _notification.onclick = function () {
                    window.location.href = notification.action;
                };

                this.getTheNumberOfUnreadMessages();
            });

    },
    methods: {
        getTheNumberOfUnreadMessages() {
            axios.get(this.$base_url + '/notifications/get-the-number-of-unread-messages', {
            }).then(response => {
                this.count_notification_badge = response.data.data.countUnReadNotifications;
            }).catch(error => {
                this.form.validation = error.response.data.errors;
            })
        },
    }
}
</script>
