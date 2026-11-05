Vue.component('general-index', {
    data() {
        return {
            route: 'settings/home-page',
            ADMIN_URL: ADMIN_URL,

            general_setting: '',
            general_logo: '',
            general_social_media_links: '',

            general_contact_us: '',
            general_footer: '',
            general_meta_options: '',
        }
    },

    props: ['settings'],

    mounted() {

        _.each(this.settings, setting => {

            switch (setting.key) {

                case 'website_name':
                    this.general_setting = mergeObject(this.general_setting, {
                        website_name: setting.value_decoded
                    });
                    break;
                case 'meta_keyword':
                    this.general_meta_options = mergeObject(this.general_setting, {
                        meta_keyword: setting.value_decoded
                    });
                    break;
                case 'meta_tag_title':
                    this.general_meta_options = mergeObject(this.general_meta_options, {
                        meta_tag_title: setting.value_decoded
                    });
                    break;
                case 'meta_description':
                    this.general_meta_options = mergeObject(this.general_setting, {
                        meta_description: setting.value_decoded
                    });
                    break;
                case 'logo':
                    this.general_logo = mergeObject(this.general_logo, {
                        logo: setting.value,
                        logo_url: setting.value_decoded
                    });
                    break;
                case 'header_logo':
                    this.general_logo = mergeObject(this.general_logo, {
                        header_logo: setting.value,
                        header_logo_url: setting.value_decoded
                    });
                    break;
                case 'alt_header_logo':
                    this.general_logo = mergeObject(this.general_logo, {
                        alt_header_logo: setting.value_decoded,
                    });
                    break;
                case 'favicon':
                    this.general_logo = mergeObject(this.general_logo, {
                        favicon: setting.value,
                        favicon_url: setting.value_decoded
                    });
                    break;
                case 'alt_favicon':
                    this.general_logo = mergeObject(this.general_logo, {
                        alt_favicon: setting.value_decoded,
                    });
                    break;
                case 'facebook':
                    this.general_social_media_links = mergeObject(this.general_social_media_links, {
                        facebook: setting.value,
                    });
                    break;
                case 'youtube':
                    this.general_social_media_links = mergeObject(this.general_social_media_links, {
                        youtube: setting.value,
                    });
                    break;
                case 'tiktok':
                    this.general_social_media_links = mergeObject(this.general_social_media_links, {
                        tiktok: setting.value,
                    });
                    break;
                case 'instagram':
                    this.general_social_media_links = mergeObject(this.general_social_media_links, {
                        instagram: setting.value,
                    });
                    break;
                case 'linkedin':
                    this.general_social_media_links = mergeObject(this.general_social_media_links, {
                        linkedin: setting.value,
                    });
                    break;
                case 'whatsapp':
                    this.general_social_media_links = mergeObject(this.general_social_media_links, {
                        whatsapp: setting.value,
                    });
                    break;
                case 'twitter':
                    this.general_social_media_links = mergeObject(this.general_social_media_links, {
                        twitter: setting.value,
                    });
                    break;
                case 'footer_about_site':
                    this.general_footer = mergeObject(this.general_footer, {
                        footer_about_site: setting.value_decoded
                    });
                    break;
                case 'mobile_1':
                    this.general_contact_us = mergeObject(this.general_contact_us, {
                        mobile_1: setting.value
                    });
                    break;
                case 'mobile_2':
                    this.general_contact_us = mergeObject(this.general_contact_us, {
                        mobile_2: setting.value
                    });
                    break;

                case 'email':
                    this.general_contact_us = mergeObject(this.general_contact_us, {
                        email: setting.value
                    });
                    break;
                case 'address':
                    this.general_contact_us = mergeObject(this.general_contact_us, {
                        address: setting.value
                    });
                    break;

            }
        });
    },

    methods: {}
});
