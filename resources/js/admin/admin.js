require('./../bootstrap');

import i18n from '../lang/admin-lang';
import Paginate from 'vuejs-paginate'

Vue.component('paginate', Paginate)

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import ElementLocaleEN from 'element-ui/lib/locale/lang/en';
import ElementLocaleAR from 'element-ui/lib/locale/lang/ar';

let ElementLocal = LANG === 'en' ? ElementLocaleEN : ElementLocaleAR;
Vue.use(ElementUI, {ElementLocal});

import CKEditor from 'ckeditor4-vue';

Vue.use(CKEditor, {extraPlugins: 'colorbutton'});
CKEditor.editorConfig = (config) => {
    config.versionCheck = false;
    config.toolbarGroups = [
        {name: 'document', groups: ['mode', 'document', 'doctools']},
        {name: 'clipboard', groups: ['clipboard', 'undo']},
        {name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing']},
        {name: 'forms', groups: ['forms']},
        '/',
        {name: 'basicstyles', groups: ['basicstyles', 'cleanup']},
        {name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph']},
        '/',
        {name: 'links', groups: ['links']},
        {name: 'insert', groups: ['insert']},
        {name: 'styles', groups: ['styles']},
        {name: 'colors', groups: ['colors']},
        {name: 'tools', groups: ['tools']},
        {name: 'others', groups: ['others']},
        {name: 'about', groups: ['about']}
    ];
}


Vue.component('page-limit', require('./components/PageLimitComponent').default);
Vue.component('upload-file', require('./components/UploadFilesComponent').default);
Vue.component('maintenance-mode', require('./components/MaintenanceMode').default);
Vue.component('el-file-upload', require('./components/ELUploadFile').default);
Vue.component('order-status', require('./components/OrderStatusComponent').default);
Vue.component('order-type', require('./components/OrderTypeComponent').default);
Vue.component('transaction-type', require('./components/TransactionTypeComponent').default);
Vue.component('transaction-status', require('./components/TransactionStatusComponent').default);
Vue.component('is-active-status', require('./components/IsActiveStatusComponent.vue').default);

require('./my-profile/change-password');

require('./admins/show');
require('./admins/form');

require('./chat/index');
require('./clients/show');

require('./roles/show');
require('./roles/form');
require('./roles/details');

require('./permissions/show');
require('./permissions/form');

require('./languages/show');
require('./languages/form');

require('./dialects/show');
require('./dialects/form');

require('./forms/show');
require('./forms/form');
require('./forms/details');

require('./categories/show');
require('./categories/form');

require('./articles/show');
require('./articles/form');

require('./services/show');
require('./services/form');

require('./banners/show');
require('./banners/form');

require('./careers/show');
require('./careers/form');
require('./careers/details');

require('./partners/show');
require('./partners/form');


require('./rating-criterias/show');
require('./rating-criterias/form');

require('./rating-groups/show');
require('./rating-groups/form');

require('./profits/show');
require('./profits/form');


require('./mail-messages/show');
require('./mail-messages/form');
require('./mail-messages/details');

require('./faqs/show');
require('./faqs/form');

require('./mailing-lists/show');

require('./pages/show');


require('./appearance/general/index');
require('./appearance/general/general');
require('./appearance/general/logo');
require('./appearance/general/social-media-links');
require('./appearance/general/contact-us');
require('./appearance/general/footer');
require('./appearance/general/meta-options');


require('./appearance/home-page/index');
require('./appearance/home-page/welcome-section');
require('./appearance/home-page/faqs-section');
require('./appearance/home-page/partners-section');
require('./appearance/home-page/clients-section');

require('./appearance/home-page/modal-section');
require('./appearance/home-page/setting-section');
require('./appearance/home-page/voices-section');
require('./appearance/home-page/booking-steps-section');
require('./appearance/home-page/categories-section');
require('./appearance/home-page/works-section');


require('./appearance/voices-page/index');


require('./settings/currencies')
require('./settings/commissions')
require('./settings/policies')
require('./settings/email')
require('./settings/payment-methods')
require('./settings/maintenance')

require('./works/show');
require('./works/form');

require('./booking-steps/show');
require('./booking-steps/form')

require('./voices/show');
require('./voices/form');

require('./voice-actors/show');
require('./voice-actors/form');

require('./guides/show');
require('./guides/form');
require('./guides/details');

require('./voice-actor-samples/show');

require('./customers/show');
require('./customers/form');

require('./coupons/show');
require('./coupons/form');

require('./contacts/index');

require('./orders/index');
require('./orders/show');
require('./orders/details');

require('./transactions/index');

require('./orders-cancellation-requests/index');

require('./notifications/show');


Vue.prototype.$root_url = ROOT_URL
Vue.prototype.$base_url = BASE_URL
Vue.prototype.$admin_prefix = ADMIN_PREFIX
Vue.prototype.$admin_url = ADMIN_URL
Vue.prototype.$token = TOKN
Vue.prototype.$user = USER
Vue.prototype.$lang = LANG
Vue.prototype.$base_url_redirect_to = '/' + LANG + '/' + ADMIN_PREFIX + '/'
Vue.prototype.$headers = {
    'X-CSRF-TOKEN': TOKN,
};

Vue.mixin({
    data() {
        return {
            route: '',
            limit: 12,
            // form: {
            //     validation: null,
            //     disabledButton: false,
            // },
        }
    },
    methods: {
        async fetchData(route_of_action) {
            this.route = route_of_action;

            showLoading();
            await axios.get(this.$admin_url + "/" + route_of_action + '/data', {
                params: {
                    page: this.page.currentPage,
                    filter: this.filter,
                    limit: this.page.itemsPerPage,
                }
            }).then(response => {
                hideLoading();
                this.data = response.data.data.data;
                this.page.totalPages = response.data.data.meta.last_page;
                this.page.totalItems = response.data.data.meta.total;
            }).catch(error => {
                hideLoading();
            });
        },
        filterData() {
            if (this.filter.length > 2) {
                this.fetchData(this.route);
            }
        },
        nextPage(val) {
            this.page.currentPage = val;
            this.fetchData(this.route);
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
                    showLoading();
                    axios.delete(this.$admin_url + "/" + this.route + "/" + id + "/delete").then(response => {
                        hideLoading();
                        sweetAlertDelete(response.data.message);
                        this.fetchData(this.route);
                    }).catch(error => {
                        hideLoading();
                        swalError(error);
                    });
                }
            });
        },
        cancel(name = '') {
            Swal.fire({
                title: this.$t('art_you_close', {name: name}),
                text: this.$t('you_will_lose_the_data_on_the_form_not_save'),
                icon: "warning",
                confirmButtonColor: '#f64e60',
                showCancelButton: true,
                confirmButtonText: this.$t('yes_definitely'),
                cancelButtonText: this.$t('cancel')
            }).then((result) => {
                if (result.value) {
                    adminRedirectTo(this.route);
                }
            });
        },
    },
})

const app = new Vue({
    el: '#admin',
    i18n,
});
