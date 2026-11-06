$(document).ready(function () {
    $('#loading-div').hide();
});

function userImageDefault(useLang = null) {
    if (useLang == null || useLang == false) {
        return ROOT_URL + '/images/user_default.png';
    } else {

        let languagesArr = languages();
        for (var val in JSON.parse(LANGUAGES)) {
            languagesArr[val] = ROOT_URL + '/images/user_default.png';
        }
        return languagesArr;
    }
}

function noImageDefault(useLang = null) {
    if (useLang == null || useLang == false) {
        return ROOT_URL + '/images/no_image2.png';
    } else {

        let languagesArr = languages();
        for (var val in JSON.parse(LANGUAGES)) {
            languagesArr[val] = ROOT_URL + '/images/no_image2.png';
        }
        return languagesArr;
    }
}

function itemImageDefault(useLang = null) {
    if (useLang == null || useLang == false) {
        return ROOT_URL + '/images/no_image.png';
    } else {

        let languagesArr = languages();
        for (var val in JSON.parse(LANGUAGES)) {
            languagesArr[val] = ROOT_URL + '/images/no_image.png';
        }
        return languagesArr;
    }
}

function slugify(title) {
    var slug = "";
    // Change to lower case
    var titleLower = title.toLowerCase();
    // Letter "e"
    slug = titleLower.replace(/e|é|è|ẽ|ẻ|ẹ|ê|ế|ề|ễ|ể|ệ/gi, 'e');
    // Letter "a"
    slug = slug.replace(/a|á|à|ã|ả|ạ|ă|ắ|ằ|ẵ|ẳ|ặ|â|ấ|ầ|ẫ|ẩ|ậ/gi, 'a');
    // Letter "o"
    slug = slug.replace(/o|ó|ò|õ|ỏ|ọ|ô|ố|ồ|ỗ|ổ|ộ|ơ|ớ|ờ|ỡ|ở|ợ/gi, 'o');
    // Letter "u"
    slug = slug.replace(/u|ú|ù|ũ|ủ|ụ|ư|ứ|ừ|ữ|ử|ự/gi, 'u');
    // Letter "d"
    slug = slug.replace(/đ/gi, 'd');
    // Trim the last whitespace
    slug = slug.replace(/\s*$/g, '');
    // Change whitespace to "-"
    slug = slug.replace(/\s+/g, '-');

    return slug;
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

function languages(bool = null) {
    return handlerLanguages(JSON.parse(LANGUAGES), bool);
}

function mergeObject(obj1, obj2) {
    return Object.assign({}, obj1, obj2);
}

function convertObject(arr) {
    return Object.assign({}, arr);
}

function showLoading() {
    document.getElementById('loading-div').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading-div').style.display = 'none';
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function sweetAlertDelete(message = 'Deleted!', timer = 2000) {
    Swal.fire({
        title: message,
        text: '',
        icon: 'success',
        confirmButtonColor: '#2778c4',
        timer: timer
    });
}

function swalSuccess(message, timer = 2000) {
    Swal.fire({
        title: message,
        text: '',
        icon: "success",
        timer: timer,
        showConfirmButton: false
    });
    hideLoading();
}

function swalError(error, period_time = 4000) {
    if (typeof (error) == 'string') {
        Swal.fire({
            title: 'Error',
            text: error,
            icon: "error",
            timer: period_time,
            showConfirmButton: true
        });
    } else {
        Swal.fire({
            title: 'Error',
            text: convertCustomErrorObjectForSwalToString(error.response.data),
            icon: "error",
            timer: period_time,
            showConfirmButton: true
        });
    }
    hideLoading();
}

function convertCustomErrorObjectForSwalToString(response) {
    var returned_string = '';

    if (response.message != undefined && response.errors != undefined && response.errors.length > 0) // custom error from helpers
    {

        if (response.errors instanceof Object) {
            $.each(response.errors, function (index, message) { // response is number of errors
                returned_string = returned_string + message + "\n";
            });
        } else { // response is single text message
            returned_string = response.message + "\n";
        }
    } else { // laravel error
        if (response.message != undefined && response.message != '') {
            returned_string = response.message;
        }
        // $.each(response, function (index, message) {
        //
        // });
    }

    return returned_string;
}

function redirectTo(link) {
    window.location.replace(link);
}

function adminRedirectTo(link) {
    window.location.replace(ADMIN_URL + '/' + link);
}

function goBack() {
    var oldURL = document.referrer;

    if (oldURL.includes(ORGINAL_URL)) {
        window.history.back();
    } else {
        window.location = "#/";
    }
}

// bootstrap tab hashing activate
$(function () {
    var hash = window.location.hash;
    hash && $('ul.nav a[href="' + hash + '"]').tab('show');

    $('.nav-tabs a').click(function (e) {
        $(this).tab('show');
        var scrollmem = $('body').scrollTop() || $('html').scrollTop();
        window.location.hash = this.hash;
        $('html,body').scrollTop(scrollmem);
    });
});

function playSound(filename) {
    var mp3Source = '<source src="' + filename + '.mp3" type="audio/mpeg">';
    var oggSource = '<source src="' + filename + '.ogg" type="audio/ogg">';
    var embedSource = '<embed hidden="true" autostart="true" loop="false" src="' + filename + '.mp3">';
    document.getElementById("sound-notification").innerHTML = '<audio autoplay>' + mp3Source + oggSource + embedSource + '</audio>';
}


function removeTags(str) {
    if ((str === null) || (str === ''))
        return false;
    else
        str = str.toString();

    // Regular expression to identify HTML tags in
    // the input string. Replacing the identified
    // HTML tag with a null string.
    return str.replace(/(<([^>]+)>)/ig, '');
}

