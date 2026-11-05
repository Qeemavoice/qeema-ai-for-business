require('../bootstrap');
import i18n from './../lang/app-lang';

import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
Vue.use(VueToast);




const app = new Vue({
    el: '#app',
    i18n,
});
