window.axios = require('axios');
window.Vue = require("vue").default;


window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

let token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

axios.interceptors.response
    .use(response => {
            return response
        },
        error => {
            //console.log(error.response.status)

            // if (error.response.status == 301)
            //     return location.href = error.response.data.data.returnUri;
            //
            // if (error.response.status == 302) {
            //     return location.href = error.response.data.data.returnUri;
            // }


            //if (error.response.status == 405) {
            //  return redirectTo('/'+LANG);
            //return redirectTo(LANG + '/error/' + btoa('405'));
            // }

            if (error.response.status == 403 || error.response.status == 419) {
                // csrf token
                //return redirectTo(LANG+'/error/' + btoa('403'));
                location.reload();
            }

            // if (error.response.status == 401) {
            //     return redirectTo('/' + LANG);
            // }

            return Promise.reject(error);
        })

import Echo from 'laravel-echo';
window.Pusher = require('pusher-js');

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.MIX_PUSHER_APP_KEY,
    cluster: process.env.MIX_PUSHER_APP_CLUSTER,
    //wsHost: window.location.hostname,
    authEndpoint:  '/broadcasting/auth',
    forceTLS: (/true/i).test(process.env.MIX_LARAVEL_WEBSOCKETS_SSL),
    //encrypted: (/true/i).test(process.env.MIX_LARAVEL_WEBSOCKETS_ENCRYPTED),
    //enabledTransports: ['ws', 'wss'],
    //wsPort: Number(process.env.MIX_LARAVEL_WEBSOCKETS_WSS_PORT),
    //wssPort: Number(process.env.MIX_LARAVEL_WEBSOCKETS_WSS_PORT),
    //disableStats: false,
});


