<?php
/*
 * Admin Panel
 */

define("ADMIN_PREFIX", 'old-admin');
define("ADMIN_NAMESPACE", 'AdminPanel');
define("ADMIN_ROUTE", 'admin');
define("ADMIN_VIEWS_DIR", 'admin_panel');
define("ADMIN_PUBLIC_DIR", 'admin_panel');
define("ADMIN_PER_PAGE", 10);
define("APP_PER_PAGE", 10);

define("ADMIN_LANG_DEFAULT", 'en');

/*
 * App Dashboard
 */
define("APP_ROUTE", 'app');
define("APP_NAMESPACE", 'App');
define("APP_PREFIX", 'app');
define("APP_PUBLIC_DIR", 'app');
define("APP_VIEWS_DIR", 'app');

define("MEDIA_PUBLIC_DIR", 'media');

/*
 * Auth
 */
define('AUTH_ROUTE', 'auth');


define('DIR_UPLOAD', 'uploads');

define('CACHE_TTL', 604800);
define('MALE', 1);
define('FEMALE', 2);
define('MALE_AND_FEMALE', 3);
define('YES', 1);
define('NO', 0);
define('PENDING', -1);
define('DATE_FORMAT', 'Y-m-d');
define('TIME_FORMAT', 'h:i:s');
define('DATE_DMY_FORMAT', 'd.m.Y');

define('ON_DELETE', 'NO ACTION'); // DB

define('WITH_300', '300'); // image size
define('WITH_600', '600'); // image size
define('WITH_1000', '1000'); // image size

define('MIN_PASSWORD', 6);

define("DS", '\\');


define('MONEY_NUMBER_FORMAT', 2); // 00.00 $


define('DAILY_AT_12_00', '12:00');

define('CHUNK_DATA', 50);


define('ENV_PRODUCTION', 'production');

define('MAX_SIZE_UPLOAD_FILE', '30720');
define('MIMES_IMAGE', 'jpeg,png,jpg,gif,svg');
define('MIMES_all', 'jpeg,png,jpg,gif,svg,pdf,doc,docx,csv,xlsx,xls');
define('MIMES_DOCUMENTS', 'pdf,doc,docx');
define('MIMES_EXCEL', 'csv,xlsx,xls');
define('MIMES_POWERPOINT', 'ppt,odt,ods,odp');
define('MIMES_ZIP', 'zip,rar');
define('MIMES_VIDEO', 'video/x-flv,video/mp4,application/x-mpegURL,video/MP2T,video/3gpp,video/quicktime,video/x-msvideo,video/x-ms-wmv');
define('MIMES_mp4', 'mp4');


define('CREATED_AT_FORMAT', 'd M Y, h:i a');


define('COMMISSION_PLATFORM', 9);
define('COMMISSION_PAYPAL', 5);
define('COMMISSION_STRIPE', 5);


//NOTIFICATIONS TYPE
define('ADMIN_NOTIFICATION_TYPE', 1);
define('APP_NOTIFICATION_TYPE', 2);
define('APP_MESSAGE_NOTIFICATION_TYPE', 3);
define('APP_MESSAGE_NOTIFICATION_ADMIN', 5);
define('APP_MESSAGE_TYPE', 4);
