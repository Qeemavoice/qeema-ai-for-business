Vue.component('home-page', {
    data() {
        return {
            route: 'settings/home-page',
            ADMIN_URL: ADMIN_URL,
            home_page_welcome_section: '',
            home_page_modal_section: '',
            home_page_setting_section: '',
            home_page_voices_section: '',
            home_page_faqs_section: '',
            home_page_clients_section: '',
            home_page_partners_section: '',
            home_page_booking_steps_section: '',
            home_page_categories_section: '',
            home_page_works_section: '',
        }
    },
    props: ['settings'],
    mounted() {
        _.each(this.settings, setting => {
            switch (setting.key) {
                case 'home_page_welcome_section':
                    this.home_page_welcome_section = setting.value_decoded;
                    break;
                case 'home_page_modal_section':
                    this.home_page_modal_section = setting.value_decoded;
                    break;
                case 'home_page_voices_section': {
                    this.home_page_voices_section = setting.value_decoded;
                    break;
                }
                case 'home_page_faqs_section': {
                    this.home_page_faqs_section = setting.value_decoded;
                    break;
                }
                case 'home_page_clients_section': {
                    this.home_page_clients_section = setting.value_decoded;
                    break;
                }
                case 'home_page_partners_section': {
                    this.home_page_partners_section = setting.value_decoded;
                    break;
                }
                case 'home_page_booking_steps_section': {
                    this.home_page_booking_steps_section = setting.value_decoded;
                    break;
                }
                case 'home_page_categories_section': {
                    this.home_page_categories_section = setting.value_decoded;
                    break;
                }
                case 'home_page_works_section': {
                    this.home_page_works_section = setting.value_decoded;
                    break;
                }
                case 'home_page_setting_section ':
                    this.home_page_setting_section = setting.value_decoded;
                    break;
            }
        });
    },
    methods: {}
});
