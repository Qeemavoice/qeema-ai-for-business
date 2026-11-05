require('../bootstrap');
import i18n from './../lang/app-lang';

import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

import Paginate from 'vuejs-paginate'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import localeEN from 'element-ui/lib/locale/lang/en';
import localeAR from 'element-ui/lib/locale/lang/ar';
import VueMask from 'v-mask'
import VueChatScroll from 'vue-chat-scroll'
import VueStarRating from 'vue-star-rating';

Vue.use(VueToast);
Vue.use(VueMask);
Vue.use(VueChatScroll)
Vue.component('paginate', Paginate)
let locale = LANG === 'en' ? localeEN : localeAR;
Vue.use(ElementUI, {locale});

Vue.component('star-rating', VueStarRating)

Vue.component('payment-form-for-booking', require('./components/PaymentFormForBooking').default);
Vue.component('payment-form-for-purchase', require('./components/PaymentFormForPurchase').default);
Vue.component('upload-file', require('./components/UploadFilesComponent').default);
Vue.component('notifications', require('./components/NotificationsComponent').default);


require('./auth/register');
require('./auth/login');
require('./auth/login-by-services');

require('./auth/password/email');
require('./auth/password/password');


require('./change-password/form');
require('./careers/application-career-form');

require('./newsletter/form');
require('./contact-us/form');

require('./home/file-modal');
//require('./home/voices');

require('./guides/guide-details-index');
require('./voices/search');
require('./pages/form');

require('./dashboard/clients/profile');
require('./dashboard/clients/work-fields');
require('./dashboard/clients/favorites');
require('./dashboard/clients/booking');
require('./dashboard/clients/invoices');
require('./dashboard/clients/feedback');

require('./dashboard/voice-actors/profile');
require('./dashboard/voice-actors/samples');
require('./dashboard/voice-actors/payment');


require('./dashboard/chat');
require('./dashboard/notifications');
require('./dashboard/orders');



Vue.prototype.$root_url = ROOT_URL
Vue.prototype.$base_url = BASE_URL
Vue.prototype.$token = TOKN
Vue.prototype.$user = USER
Vue.prototype.$lang = LANG
Vue.prototype.$user_type_client = USER_TYPE_CLIENT
Vue.prototype.$user_type_voice_actor = USER_TYPE_VOICE_ACTOR
Vue.prototype.$current_currency = CURRENT_CURRENCY
Vue.prototype.$headers = {
    'X-CSRF-TOKEN': TOKN,
};


Vue.mixin({
    data() {
        return {
            route: '',
            data: [],
            form: {
                validation: null,
                disabledButton: false,
                loadingDisplay: false,
            },
            page: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10
            },
            orderBy: {
                column: 'id',
                direction: 'desc',
            },
            limit: 12,
        }
    },
    methods: {
        async fetchData(route_of_action) {
            this.route = route_of_action;
            this.form.loadingDisplay = true;
            await axios.get(this.$base_url + "/" + route_of_action + '/data', {
                params: {
                    page: this.page.currentPage,
                    filter: this.filter,
                    limit: this.limit,
                    orderBy: this.orderBy,
                }
            }).then(response => {
                this.form.loadingDisplay = false;
                this.data = response.data.data.data;
                this.page.totalPages = response.data.data.meta.last_page;
                this.page.totalItems = response.data.data.meta.total;
            }).catch(error => {
                this.form.loadingDisplay = false;
            });
        },
        nextPage(val) {
            this.page.currentPage = val;
            this.fetchData(this.route);
        },
        addOrRemoveToFavorite(voiceId) {
            this.form.disabledButton = true;
            axios.post(this.$base_url + '/clients/favorites/store', {
                id: voiceId,
            }).then(response => {
                toastSuccess();
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                if (response.data.data && response.data.data.id)
                    $('#audio_favorite_icon_' + voiceId).css('color', 'red');
                else
                    $('#audio_favorite_icon_' + voiceId).css('color', '');
            }).catch(error => {
                this.form.disabledButton = false;
                this.form.loadingDisplay = false;
                toastError(error);
            })
        },
        updateListen(voiceId) {
            if (!$('#counter_listens_' + voiceId).hasClass('_listen')) {
                if (this.$user && this.$user.role_id === this.$user_type_client) {
                    this.form.disabledButton = true;
                    axios.put(this.$base_url + '/clients/voices/update-listened', {
                        id: voiceId,
                    }).then(response => {
                        this.playOrStopAudio(voiceId);
                        this.form.disabledButton = false;
                        this.form.loadingDisplay = false;
                    }).catch(error => {
                        this.form.disabledButton = false;
                        this.form.loadingDisplay = false;
                        toastError(error);
                    })
                } else {
                    this.playOrStopAudio(voiceId);
                }
            } else {
                this.playOrStopAudio(voiceId);
            }
        },
        handlePlay(voiceId) {
            if (this.$user && this.$user.role_id === this.$user_type_client) {
                this.form.disabledButton = true;
                axios.put(this.$base_url + '/clients/voices/update-listened', {
                    id: voiceId,
                }).then(response => {
                    this.playOrStopAudio(voiceId);
                    this.form.disabledButton = false;
                    this.form.loadingDisplay = false;
                }).catch(error => {
                    this.form.disabledButton = false;
                    this.form.loadingDisplay = false;
                    toastError(error);
                })
            }
        },
        updateLike(voiceId) {
            axios.put(this.$base_url + '/clients/voices/update-likes', {
                id: voiceId,
                isLike: $("#audio_like_icon_" + voiceId).hasClass('red-color'),
            }).then(response => {
                toastSuccess();
                if ($("#audio_like_icon_" + voiceId).hasClass('black-color')) {
                    likedAudio(voiceId);
                } else {
                    disLikeAudio(voiceId);
                }
            }).catch(error => {
                toastError(error);
            });
        },
        playOrStopAudio(voiceId) {
            if ($('#audio_controller_icon_' + voiceId).hasClass('fa-play')) {
                playAudio(voiceId);
            } else {
                stopAudio(voiceId);
            }
        },
        deleteRow(id, name) {
            Swal.fire({
                title: this.$t('art_you_delete', {name: name}),
                text: this.$t('you_wont_be_able_to_revert_this'),
                icon: "warning",
                confirmButtonColor: '#F64E60',
                showCancelButton: true,
                confirmButtonText: this.$t('yes_delete_it'),
                cancelButtonText: this.$t('cancel')
            }).then((result) => {
                if (result.value) {
                    this.form.loadingDisplay = true;
                    axios.delete(this.$base_url + "/" + this.route + "/" + id + "/delete").then(response => {
                        this.form.loadingDisplay = false;
                        toastSuccess(response.data.message);
                        this.fetchData(this.route);
                    }).catch(error => {
                        this.form.loadingDisplay = false;
                        toastError(error);
                    });
                }
            });
        },
        receiveOrder() {
            Swal.fire({
                title: this.$t('do_you_want_to_receive_the_reservation', {name: name}),
                text: this.$t('you_wont_be_able_to_revert_this'),
                icon: "warning",
                confirmButtonColor: '#F64E60',
                showCancelButton: true,
                confirmButtonText: this.$t('yes_it'),
                cancelButtonText: this.$t('cancel')
            }).then((result) => {
                if (result.value) {
                    $('#rating_form').modal('show');

                    // this.form.loadingDisplay = true;
                    // axios.put(this.$base_url + '/clients/orders/' + this.orderId + '/complete').then(response => {
                    //     this.form.loadingDisplay = false;
                    //     toastSuccess(response.data.message);
                    //     window.location.reload();
                    // }).catch(error => {
                    //     this.form.loadingDisplay = false;
                    //     toastError(error);
                    // });
                }
            });
        },
    },
})

const app = new Vue({
    el: '#app',
    i18n,
});
