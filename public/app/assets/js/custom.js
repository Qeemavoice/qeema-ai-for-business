let durationToast = 5000;

function toastSuccess(message = '', duration = null) {
    duration = duration ? duration : durationToast;
    message = message ? message : SUCCESS_MESSAGE;
    Vue.$toast.success(message, {duration: duration});
}

function languages(bool = null) {
    return handlerLanguages(JSON.parse(LANGUAGES), bool);
}

function handlerLanguages(languages, bool) {
    for (var val in languages) {
        if (bool == true || bool == false) {
            languages[val] = bool;
        } else {
            languages[val] = '';
        }
    }
    return languages;
}

function toastError(error = '', duration = null, isListError = false) {
    duration = duration ? duration : durationToast;
    let message = ERROR_MESSAGE;
    if (typeof error === 'string')
        message = error;
    else
        message = error ? (isListError ? convertCustomErrorObjectForToastToString(error.response.data) : error.response.data.message) : ERROR_MESSAGE
    Vue.$toast.error(message, {duration: duration});
}


function convertCustomErrorObjectForToastToString(response) {
    var returned_string = '';

    if (response.message != undefined && response.errors != undefined) // custom error from helpers
    {
        if (response.errors instanceof Object) {
            $.each(response.errors, function (index, message) { // response is number of errors
                returned_string = returned_string + message + "\n";
            });
        } else { // response is single text message
            returned_string = response.message + "\n";
        }
    } else { // laravel error
        $.each(response, function (index, message) {
            returned_string = returned_string + message + "\n";
        });
    }

    return returned_string;
}

function toastInfo(message, duration = null) {
    duration = duration ? duration : durationToast;
    Vue.$toast.info(message, {duration: duration});
}

function toastWarning(message, duration = null) {
    duration = duration ? duration : durationToast;
    Vue.$toast.warning(message, {duration: duration});
}

function toastDefault(message, duration = null) {
    duration = duration ? duration : durationToast;
    Vue.$toast.default(message, {duration: duration});
}

function redirectTo(link) {
    window.location.replace(link);
}


function mergeObject(obj1, obj2) {
    return Object.assign({}, obj1, obj2);
}


function playAudio(id) {
    document.getElementById('voice_audio_' + id).play();

    this.updateIconAudio(id);

    $('#counter_listens_' + id).addClass('_listen');
    $('#counter_listens_' + id).text(parseInt($('#counter_listens_' + id).attr('counter')) + 1);
}

function stopAudio(id) {
    const audio = document.getElementById('voice_audio_' + id);
    audio.pause();
    audio.currentTime = 0;

    updateIconAudio(id);
}

function updateIconAudio(id) {
    const iconAudio = $('#audio_controller_icon_' + id);

    if (iconAudio.hasClass('fa-play')) {
        iconAudio.removeClass('fa-play')
        iconAudio.addClass('fa-pause')
    } else {
        iconAudio.removeClass('fa-pause')
        iconAudio.addClass('fa-play')
    }
}

function likedAudio(id) {
    const audioLikeIcon = $('#audio_like_icon_' + id);
    const audioCounterLike = $('#audio_counter_like_' + id);

    audioLikeIcon.addClass('red-color');
    audioLikeIcon.removeClass('black-color');

    const currentCounterLike = parseInt(audioCounterLike.attr('counter'));
    const newCounterLike = currentCounterLike + 1;

    audioCounterLike.text(newCounterLike);
    audioCounterLike.attr('counter', newCounterLike)
}

function disLikeAudio(id) {
    const audioLikeIcon = $('#audio_like_icon_' + id);
    const audioCounterLike = $('#audio_counter_like_' + id);

    audioLikeIcon.addClass('black-color');
    audioLikeIcon.removeClass('red-color');

    const currentCounterLike = parseInt(audioCounterLike.attr('counter'));
    const newCounterLike = currentCounterLike - 1;

    audioCounterLike.text(newCounterLike);
    audioCounterLike.attr('counter', newCounterLike)
}

function isValidEmail(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

function getIdBySlug(slug) {
    return slug.split("-")[0];
}

function sumArray(array) {
    let sum = 0;
    for (let index = 0; index < array.length; index++) {
        sum += array[index];
    }
    return sum;
}

function playSound(filename) {
    var mp3Source = '<source src="' + filename + '.mp3" type="audio/mpeg">';
    var oggSource = '<source src="' + filename + '.ogg" type="audio/ogg">';
    var embedSource = '<embed hidden="true" autostart="true" loop="false" src="' + filename + '.mp3">';
    document.getElementById("sound-notification").innerHTML = '<audio autoplay>' + mp3Source + oggSource + embedSource + '</audio>';
}
