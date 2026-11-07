<?php

use App\Models\Banner;
use App\Models\User;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

if (!function_exists('slugRouteCategories')) {
    function slugRouteCategories()
    {
        return config('slugroute.slug_categories');
    }
}

if (!function_exists('slugRouteVoices')) {
    function slugRouteVoices()
    {
        return config('slugroute.slug_voices');
    }
}

if (!function_exists('slugRouteBookingSteps')) {
    function slugRouteBookingSteps()
    {
        return config('slugroute.slug_booking_steps');
    }
}

if (!function_exists('slugRouteBlogs')) {
    function slugRouteBlogs()
    {
        return config('slugroute.slug_blogs');
    }
}

if (!function_exists('slugRouteOurWorks')) {
    function slugRouteOurWorks()
    {
        return config('slugroute.slug_our_works');
    }
}

if (!function_exists('slugRouteContactUs')) {
    function slugRouteContactUs()
    {
        return config('slugroute.slug_contact_us');
    }
}

if (!function_exists('slugRouteFaq')) {
    function slugRouteFaq()
    {
        return config('slugroute.slug_faq');
    }
}

if (!function_exists('searchFile')) {
    function searchFile($directory, $filename)
    {
        $directory = public_path($directory);
        $results = [];

        // نجلب كل الملفات من المجلد (مع المجلدات الفرعية)
        $files = File::allFiles($directory);

        foreach ($files as $file) {
            if ($file->getFilename() === $filename) {
                $results[] = $file->getPathname(); // المسار الكامل
            }
        }

        return $results;
    }
}

function getUserByName($textAr = '', $textEn = '')
{
    return User::query()
        ->where(function ($query) use ($textAr, $textEn) {

            // الحالة 1: JSON عادي
            $query->whereRaw("
            JSON_VALID(full_name) AND (
                LOWER(JSON_UNQUOTE(JSON_EXTRACT(full_name, '$.en'))) = ?
                OR JSON_UNQUOTE(JSON_EXTRACT(full_name, '$.ar')) = ?
            )
        ", [strtolower($textEn), $textAr])

                // الحالة 2: JSON مزدوج الترميز
                ->orWhereRaw("
            JSON_VALID(full_name)
            AND JSON_VALID(JSON_UNQUOTE(JSON_EXTRACT(full_name, '$.ar')))
            AND (
                LOWER(JSON_UNQUOTE(JSON_EXTRACT(JSON_UNQUOTE(JSON_EXTRACT(full_name, '$.ar')), '$.en'))) = ?
                OR JSON_UNQUOTE(JSON_EXTRACT(JSON_UNQUOTE(JSON_EXTRACT(full_name, '$.ar')), '$.ar')) = ?
            )
        ", [strtolower($textEn), $textAr])

                // الحالة 3: نص عادي
                ->orWhereRaw("
            NOT JSON_VALID(full_name)
            AND (full_name = ? OR full_name = ?)
        ", [$textAr, $textEn]);

        })
        ->first();
}

function copyFilesFromOtherProjectOld($filename, $newPath, $oldProjectFolderName = '')
{
    // مسار المشروع الأب (مثلاً /var/www/)
    if (config('app.env') != 'local') {
        $projectsBasePath = DIRECTORY_SEPARATOR . 'var' . DIRECTORY_SEPARATOR . 'www' . DIRECTORY_SEPARATOR;
        //$oldProjectFolderName = 'v3.qeemavoice.com';
        $oldProjectFolderName = 'qeemavoice';
    } else {
        $projectsBasePath = dirname(base_path()) . DIRECTORY_SEPARATOR;
        $oldProjectFolderName = 'qeemavoice';
    }

    // بناء المسار الكامل للمشروع القديم
    $oldProjectUploads = $projectsBasePath . $oldProjectFolderName . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'uploads';

    // المسار الحالي للمشروع الجديد (ديناميكي)
    $newProjectUploads = public_path('uploads' . DIRECTORY_SEPARATOR . $newPath);

    $results = [];

    // البحث عن الملفات داخل المشروع القديم
    $files = File::allFiles($oldProjectUploads);

    foreach ($files as $file) {
        if ($file->getFilename() === $filename) {
            $oldPath = $file->getPathname();
            $newFullPath = $newProjectUploads . DIRECTORY_SEPARATOR . $filename;

            // معالجة وجود الملف مسبقاً لتجنب الاستبدال
            $counter = 1;
            while (File::exists($newFullPath)) {
                $fileInfo = pathinfo($filename);
                $newFullPath = $newProjectUploads . DIRECTORY_SEPARATOR . $fileInfo['filename'] . "_$counter." . $fileInfo['extension'];
                $counter++;
            }

            if (!File::exists($newProjectUploads)) {
                File::makeDirectory($newProjectUploads, 0755, true);
            }

            File::copy($oldPath, $newFullPath);
            $results[] = $newFullPath;
        }
    }

    return $results;
}


function copyFilesFromOtherProject($filename, $newPath)
{
    //v3.qeemavoice.com
    $basePath = '/var/www/qeemavoice/public/uploads';
    $newFullPath = public_path("uploads/$newPath/$filename");

    foreach (File::allFiles($basePath) as $file) {
        if ($file->getFilename() === $filename) {

            if (!File::exists($newFullPath)) {
                File::ensureDirectoryExists(dirname($newFullPath));
                File::copy($file->getPathname(), $newFullPath);
            }

            return true; // وجد الملف وتوقف
        }
    }

    return false; // لم يُعثر عليه
}

if (!function_exists('searchAndMoveFiles')) {
    function searchAndMoveFiles($directory, $filename, $newPath, $move = true)
    {
        $results = [];

        // نبحث في كل الملفات داخل المجلد الرئيسي والفرعي
        $files = File::allFiles($directory);

        foreach ($files as $file) {
            if ($file->getFilename() === $filename) {
                $oldPath = $file->getPathname();
                $newFullPath = $newPath . DIRECTORY_SEPARATOR . $filename;

                // إذا الملف موجود مسبقاً في الوجهة نضيف رقم لتفادي الاستبدال
                $counter = 1;
                while (File::exists($newFullPath)) {
                    $fileInfo = pathinfo($filename);
                    $newFullPath = $newPath . DIRECTORY_SEPARATOR . $fileInfo['filename'] . "_$counter." . $fileInfo['extension'];
                    $counter++;
                }

                // إنشاء المجلد الجديد إذا لم يكن موجود
                if (!File::exists($newPath)) {
                    Log::channel('files')->info('filename: ' . $filename);
                    continue;
                }

                // نقل أو نسخ الملف
                if ($move) {
                    File::move($oldPath, $newFullPath);
                } else {
                    File::copy($oldPath, $newFullPath);
                }

                $results[] = $newFullPath;
            }
        }

        return $results; // قائمة بكل الملفات المنقولة أو المنسوخة
    }
}

if (!function_exists('add_properties_to_object_from_another-object')) {
    function add_properties_to_object_from_another($obj1, $obj12)
    {
        return (object)array_merge((array)$obj1, (array)$obj12);
    }
}

if (!function_exists('is_set')) {
    function is_set($data, $default = null)
    {
        return isset($data) ? $data : $default;
    }
}

if (!function_exists('get_id_by_slug')) {

    function get_id_by_slug($slug)
    {
        return explode('-', $slug)[0];
    }
}

if (!function_exists('get_banner')) {
    function get_banner($page, $position = 'top')
    {
        $list = Banner::where('page', $page)->where('position', $position)->get();
        if ($position == 'top')
            $list = $list->first();
        return $list;
    }
}

if (!function_exists('slugify')) {
    function slugify($text, $separator = '-')
    {
        if (is_null($text)) {
            return "";
        }

        // Remove spaces from the beginning and from the end of the string
        $string = trim($text);

        // Lower case everything
        // using mb_strtolower() function is important for non-Latin UTF-8 string | more info: https://www.php.net/manual/en/function.mb-strtolower.php
        $string = mb_strtolower($string, "UTF-8");;

        // Make alphanumeric (removes all other characters)
        // this makes the string safe especially when used as a part of a URL
        // this keeps latin characters and arabic charactrs as well
        $string = preg_replace('/[^\\p{L}\\p{N}_\\s-]/u', '', $string);

        // Remove multiple dashes or whitespaces
        $string = preg_replace("/[\s-]+/", " ", $string);

        // Convert whitespaces and underscore to the given separator
        $string = preg_replace("/[\s_]/", $separator, $string);

        return $string;
    }
}


if (!function_exists('generate_unique_number')) {
    function generate_unique_number($min = 0, $max = 9, $quantity = 4)
    {
        $numbers = range($min, $max);
        shuffle($numbers);
        return implode(array_slice($numbers, 0, $quantity));
    }
}


if (!function_exists('trans_admin')) {
    function trans_admin($key, $replace = [], $locale = null)
    {
        return trans('admin.' . $key, $replace, $locale);
    }
}

if (!function_exists('trans_notification')) {
    function trans_notification($key, $replace = [], $locale = null)
    {
        return trans('notifications.' . $key, $replace, $locale);
    }
}

if (!function_exists('text_replace')) {

    /**
     * تنظيف النص حسب النوع
     *
     * @param string $text
     * @param int $type
     * 1 = trim
     * 2 = slug
     * 3 = clean text
     * @return string
     */
    function text_replace($text, $type = 1)
    {
        switch ($type) {

            case 1:
                // تنظيف بسيط
                return trim($text);

            case 2:
                // تحويل إلى رابط (slug)
                return Str::slug($text);

            case 3:
                // تنظيف النص للعرض
                return trim(strip_tags(html_entity_decode($text)));

            default:
                return trim($text);
        }
    }
}

if (!function_exists('trans_app')) {
    function trans_app($key, $replace = [], $locale = null)
    {
        return trans('app.' . $key, $replace, $locale);
    }
}

if (!function_exists('trans_seo')) {
    function trans_seo($key, $replace = [], $locale = null)
    {
        return trans('seo.' . $key, $replace, $locale);
    }
}

if (!function_exists('trans_emails')) {
    function trans_emails($key, $replace = [], $locale = null)
    {
        return trans('emails.' . $key, $replace, $locale);
    }
}

if (!function_exists('route_admin')) {
    function route_admin($name = null, $parameter = [])
    {
        return route(ADMIN_ROUTE . '.' . $name, $parameter);
    }
}

if (!function_exists('route_app')) {
    function route_app($name = null, $parameter = [])
    {
        return route(APP_ROUTE . '.' . $name, $parameter);
    }
}

if (!function_exists('route_auth')) {
    function route_auth($name = null, $parameter = [])
    {
        return route(AUTH_ROUTE . '.' . $name, $parameter);
    }
}

if (!function_exists('route_is')) {
    function route_is($name = null)
    {
        return request()->routeIs(ADMIN_ROUTE . '.' . $name);
    }
}

if (!function_exists('asset_admin')) {
    function asset_admin($url)
    {
        return asset(ADMIN_PUBLIC_DIR . '/assets/' . $url);
    }
}

if (!function_exists('asset_app')) {
    function asset_app($url)
    {
        return asset(APP_PUBLIC_DIR . '/assets/' . $url);
    }
}


if (!function_exists('asset_media')) {
    function asset_media($dir, $url)
    {
        return asset(MEDIA_PUBLIC_DIR . '/' . $dir . '/' . $url);
    }
}

if (!function_exists('user')) {
    function user()
    {
        return auth()->guard()->user();
    }
}

if (!function_exists('languages')) {
    function languages()
    {
        return config('app.locales');
    }
}

if (!function_exists('get_locale')) {
    function get_locale()
    {
        return app()->getLocale();
    }
}

if (!function_exists('get_locale_text')) {
    function get_locale_text()
    {
        return languages()[get_locale()];
    }
}


if (!function_exists('meta')) {
    function meta($key, $value = null)
    {
        if ($value) {
            \App\Services\Meta::set($key, $value);
        }
        return \App\Services\Meta::get($key);
    }
}

if (!function_exists('meta_data')) {
    function meta_data($page_title = '', $breadcrumbs_title = '', $breadcrumbs = [], $description = '')
    {
        meta('page-title', $page_title);
        meta('breadcrumbs-title', $breadcrumbs_title);
        meta('breadcrumbs-description', $description);
        meta('breadcrumbs', $breadcrumbs);
    }
}


if (!function_exists('app_name')) {
    function app_name()
    {
        $name = getSetting('website_name', true);
        return $name ? $name->{get_locale()} : app_name_config();
    }
}

if (!function_exists('app_name_config')) {
    function app_name_config()
    {
        return config('app.name');
    }
}

function stringReplace($text, $type = 0)
{
    $search = array();
    if ($type == 1) {// clear details
        $search = array();
        $str = str_replace($search, '', $text);
        //   $str = strip_tags($str);
        $str = trim($str);
        return $str;
    } else if ($type == 2) {//clear to link ;
        $search = array(';', '/', '.', ',', '!', '@', '#', '$', '%', '^', '*', '(', ')', '=', '+', '~', '&', '"', '||', "'", '&quot;', '&ldquo;', '&rdquo;', '&lsquo;', '&rsquo;', '&mdash;', '&ndash;', '<div>', '</div>', '|', '&laquo;', '&nbsp;', '&raquo;', '&middot');
        $text = str_replace($search, '', $text);
        return str_replace(" ", "-", strip_tags($text));
    } else if ($type == 3) {//clear to link ;
        $search = array('"', '||', '&quot;', '&ldquo;', '&rdquo;', '&lsquo;', '&rsquo;', '&mdash;', '&ndash;', '<div>', '</div>', '|', '&laquo;', '&nbsp;', '&raquo;', '&middot');
        $text = str_replace($search, '', $text);
        $text = strip_tags($text);
        return trim($text);
    }
}

if (!function_exists('asset_upload')) {
    function asset_upload($path)
    {
        return asset(DIR_UPLOAD . '/' . $path);
    }
}

if (!function_exists('url_lang')) {
    function url_lang($url = null, $parameters = [])
    {
        return url('/' . get_locale() . '/' . $url, $parameters);
    }
}

if (!function_exists('generateUniqId')) {
    function generate_uniq_id($limit = 20)
    {
        return substr(base_convert(sha1(uniqid(mt_rand())), 16, 36), 0, $limit);
    }
}

if (!function_exists('password_rules')) {
    function password_rules($required = false, $isConfirmed = false, $isRegex = false, $min = '8')
    {
        $rules = [
            $required ? 'required' : 'nullable',
            'string',
            'min:' . $min,

        ];
        $rules = $isConfirmed ? array_merge($rules, ['confirmed']) : $rules;
        $regex = 'regex:/^.*(?=.{3,})(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[\d\x])(?=.*[!$#%]).*$/';
        $rules = $isRegex ? array_merge($rules, [$regex]) : $rules;
        return $rules;
    }
}

if (!function_exists('mobile_regex')) {
    function mobile_regex($typeOf = 'string')
    {
        if ($typeOf == 'array')
            return ['regex:/^([0-9\s\-\+\(\)]*)$/'];
        return 'regex:/^([0-9\s\-\+\(\)]*)$/';
    }
}


if (!function_exists('redirectToBack')) {
    function redirectToBack($message = null, $isJson = false)
    {
        if (session()->previousUrl()) {
            return $isJson ? back()->getTargetUrl() : back()->with('warning_message', $message);
        }
        return $isJson ? route_app('home.index') : redirect()->route('app.home.index')->with('warning_message', $message);
    }
}

if (!function_exists('build_fields')) {
    function build_fields($name, $translate = null, $value = null, $type = "text", $other = null, $note = null)
    {
        $lang = languages();
        $out = "";
        if (!is_null($other)) {
            $others = "";
            foreach ($other as $key => $o) {
                $others .= "$key = '$o' ";
            }
        } else {
            $others = null;
        }

        $out .= '<div class="row">';

        $counter = 0;

        foreach ($lang as $key => $lan) {
            ++$counter;
            $newValue = $value != null ? $value[$lan] : null;

            if (count($lang) > 1)
                $out .= '<div class="col-lg-6 mb-8">';
            else
                $out .= '<div class="col-lg-12 mb-8">';

            $out .= '<div class="form-group">';
            $out .= '<label class="form-label mb-2" for="' . $name . ' . ' . $key . '" >' . $translate . ' (' . trans('admin.in_the_language') . ' ' . $lan . ')</label >';
            //     $out .= '<label for="' . $name . ' . ' . $key . '" class="d-flex align-items-center fs-5 fw-bold mb-2"><span class="required">' . $translate . '(' . ucfirst($key) . ')' . '</span></label >';
            if ($type != 'textarea') {


                $out .= '<input type = "' . $type . '" class="form-control"  v-model="' . $name . '.' . $key . '"
                      id = "' . $name . ' . ' . $key . '"  value="' . $newValue . '"  />
                          <span class="form-control-feedback error-block" v-if=\'form.validation && form.validation["' . $name . '.' . $key . '"]\'>{{ form.validation["' . $name . '.' . $key . '"][0] }}</span>
                          <span class="form-text">' . $note . '</span>';

            } else {

                $out .= '<textarea  v-model="' . $name . '.' . $key . '"   name="' . $name . '[' . $lan . ']" id = "' . $name . '.' . $key . '" class="form-control"   placeholder="' . $translate . '(' . strtoupper($key) . ')' . '" rows="4" ' . $others . '>' . $newValue . '</textarea>
                    <span class="form-control-feedback error-block" v-if=\'form.validation && form.validation["' . $name . '.' . $key . '"]\'>{{ form.validation["' . $name . '.' . $key . '"][0] }}</span>
                    <span class="form-text">' . $note . '</span>
                    ';

            }
            $out .= '</div >';
            $out .= '</div >';
        }
        $out .= '</div >';
        return $out;
    }
}

if (!function_exists('my_public')) {
    function my_public()
    {
        return base_path() . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR;
    }
}

if (!function_exists('get_order_number')) {
    function get_order_number($id)
    {
        return "#ORD-" . str_pad($id, 5, "0", STR_PAD_LEFT);
    }
}

if (!function_exists('get_invoice_number')) {
    function get_invoice_number($id)
    {
        return '#INV-' . str_pad($id, 5, "0", STR_PAD_LEFT);
    }
}

if (!function_exists('get_voice_number')) {
    function get_voice_number($id)
    {
        return '#VOI-' . str_pad($id, 5, "0", STR_PAD_LEFT);
    }
}

if (!function_exists('flash_success')) {
    function flash_success($message)
    {
        session()->flash('success_message', $message);
    }
}

if (!function_exists('flash_error')) {
    function flash_error($message)
    {
        session()->flash('error_message', $message);
    }
}

function shortText($text, $limit = 120)
{
    return Str::of($text)->limit($limit) . '...';
}

if (!function_exists('active_link_sidebar')) {
    function active_link_sidebar($chosenURl): string
    {
        $segment2 = request()->segment(2);
        $segment3 = request()->segment(3);
        $segment4 = request()->segment(4);
        $segment5 = request()->segment(5);
        $currentURL = 'dashboard';


        if ($segment2 && $segment2 !== ADMIN_PREFIX)
            $currentURL = $segment2;

        if ($segment3)
            $currentURL = $segment3;

        if ($segment4)
            $currentURL = $segment4;

        if ($segment5)
            $currentURL = $segment5;

        if ($segment4 === 'create' || $segment5 === 'edit' || $segment5 === 'details')
            $currentURL = $segment3;

        return $currentURL == $chosenURl ? 'here' : '';
    }
}


if (!function_exists('active_link_sidebar_app')) {
    function active_link_sidebar_app(...$asRoutes): string
    {
        foreach ($asRoutes as $pattern) {
            if (Str::is($pattern, request()->segment(2))) {
                return 'active';
            }
        }

        return '';
    }
}


if (!function_exists('arrow_down_url_sidebar')) {
    function arrow_down_url_sidebar(array $chosenURl)
    {
        $segment2 = request()->segment(2);
        $segment3 = request()->segment(3);
        $segment4 = request()->segment(4);
        $segment5 = request()->segment(5);
        $currentURL = 'dashboard';

        if ($segment2 && $segment2 !== ADMIN_PREFIX)
            $currentURL = $segment2;

        if ($segment3)
            $currentURL = $segment3;

        if ($segment4)
            $currentURL = $segment4;

        if ($segment5)
            $currentURL = $segment5;


        if ($segment4 === 'create' || $segment5 === 'edit' || $segment5 === 'details')
            $currentURL = $segment3;

        return in_array($currentURL, $chosenURl) ? 'here show' : '';
    }
}




if (!function_exists('canUseNewFeatures')) {
    /** «روّاد قيمة» gate: credits, plans, top-up and TTS (config/rowad.php). Opens for everyone at public_launch_at. */
    function canUseNewFeatures($user = null): bool
    {
        return \App\Services\RowadService::canUseNewFeatures($user);
    }
}
