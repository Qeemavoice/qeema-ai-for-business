<?php


namespace App\Http\Controllers\AdminPanel;


use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\AuthServiceProvider;
use App\Models\Banner;
use App\Models\Career;
use App\Models\CareerApplicant;
use App\Models\Category;
use App\Models\Country;
use App\Models\Coupon;
use App\Models\Customer;
use App\Models\Dialect;
use App\Models\Faq;
use App\Models\Favorite;
use App\Models\Guide;
use App\Models\GuideComment;
use App\Models\GuideDownload;
use App\Models\Language;
use App\Models\MailingList;
use App\Models\MailMessage;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemDetail;
use App\Models\OrderStatus;
use App\Models\OrderType;
use App\Models\Page;
use App\Models\Partner;
use App\Models\PaymentMethod;
use App\Models\RatingGroup;
use App\Models\Service;
use App\Models\Setting;
use App\Models\Transaction;
use App\Models\TransactionStatus;
use App\Models\TransactionType;
use App\Models\User;
use App\Models\UserLanguage;
use App\Models\UserProfile;
use App\Models\UserRating;
use App\Models\UserStatus;
use App\Models\UserType;
use App\Models\UserWorkField;
use App\Models\Voice;
use App\Models\VoiceCategory;
use App\Models\VoiceStatus;
use App\Models\Wallet;
use App\Models\WithdrawalMethod;
use App\Models\Work;
use App\Services\CurrencyHelper;
use App\Services\WalletHelper;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\File;

class SynDatabaseController extends Controller
{

    public function synIndex()
    {
        $pageTitle = trans_admin('syn');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);
        return view(ADMIN_VIEWS_DIR . '.' . 'syn' . '.index', compact('pageTitle'));
    }

    public function synCustomers()
    {
        try {
            $data = DB::connection('mysql2')->table('customers')->get();

            Customer::truncate();

            $list = [];

            if ($data && count($data) > 0) {
                foreach ($data as $d) {

                    $image = DB::connection('mysql2')->table('media')
                        ->Where('model_id', $d->id)
                        ->Where('model_type', Customer::class)
                        ->first();


                    if (!is_null($image->file_name) && !empty($image->file_name)) {

                        $dir = Customer::DIR_CUSTOMER_UPLOADS;


                        $fileName = $image->file_name;

                        if (File::exists(DIR_UPLOAD . '/' . $dir . '/' . $fileName)) {
                            File::delete(DIR_UPLOAD . '/' . $dir . '/' . $fileName);
                        }
                        copyFilesFromOtherProject($fileName, Customer::DIR_CUSTOMER_UPLOADS);
                    }


                    $list = [
                        'id' => $d->id,
                        'name' => ['ar' => $d->title_ar, 'en' => $d->title_en],
                        'alt' => ['ar' => $d->alt_text_ar, 'en' => $d->alt_text_en],
                        'image' => $image->file_name,
                        'deleted_at' => $d->deleted_at,
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                    ];

                    Customer::query()->create($list);
                }


            }
            dd('synCustomer');
        } catch (\Exception $exception) {
            dd($exception->getMessage());
        }
    }

    public function synContactUs()
    {
        try {
            $data = DB::connection('mysql2')->table('contact_mails')->get();

            MailMessage::truncate();

            $list = [];

            if ($data && count($data) > 0) {
                foreach ($data as $d) {
                    $list[] = [
                        'id' => $d->id,
                        'full_name' => $d->title,
                        'from' => $d->email,
                        'content' => $d->content,
                        'source' => 1,
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                    ];
                }

                $flag[] = MailMessage::query()->insert($list);
            }
            dd('synContactUs');
        } catch (\Exception $exception) {
            dd($exception->getMessage());
        }
    }

    public function synMailingLists()
    {
        try {
            $data = DB::connection('mysql2')->table('mailing_lists')->get();

            MailingList::truncate();

            $list = [];

            if ($data && count($data) > 0) {
                foreach ($data as $d) {
                    $list[] = [
                        'id' => $d->id,
                        'email' => $d->email,
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                    ];
                }

                $flag[] = MailingList::query()->insert($list);
            }
            dd('synMailingLists');
        } catch (\Exception $exception) {
            dd($exception);
        }
    }

    public function synJobs()
    {
        try {
            $data = DB::connection('mysql2')->table('jobs')->get();
            $data2 = DB::connection('mysql2')->table('jobs_apply')->get();
            Schema::table('careers', function () {
                DB::statement('
                SET foreign_key_checks = 0;
            ');
            });
            Schema::table('jobs_apply', function () {
                DB::statement('
                SET foreign_key_checks = 0;
            ');
            });
            Career::truncate();
            CareerApplicant::truncate();

            if ($data && count($data) > 0) {
                foreach ($data as $d) {
                    $list = [
                        'id' => $d->id,
                        'title' => ['ar' => $d->title, 'en' => ''],
                        'job_title' => ['ar' => $d->job_title, 'en' => ''],
                        'experience' => ['ar' => $d->experience, 'en' => ''],
                        'responsibilities' => ['ar' => $d->responsibilities, 'en' => ''],
                        'tasks' => ['ar' => $d->tasks, 'en' => ''],
                        'min_salary' => $d->from_salary,
                        'max_salary' => $d->to_salary,
                        'external_image' => $d->image,
                        'interior_image' => $d->image_mobile,
                        'status' => $d->status,
                        'workplace_type' => $d->system_work,
                        'type' => $d->nature_work,
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                        'deleted_at' => $d->deleted_at,
                    ];

                    $c = Career::query()->create($list);
                }


                if ($data2 && count($data2) > 0) {
                    foreach ($data2 as $d) {
                        CareerApplicant::create([
                            'id' => $d->id,
                            'full_name' => $d->name,
                            'email' => $d->email,
                            'mobile' => $d->mobile,
                            'career_id' => $d->job_id,
                        ]);
                    }
                }
            }
            dd('synJobs');
        } catch (\Exception $exception) {
            dd($exception);
        }
    }

    public function synCoupons()
    {
        try {
            $data = DB::connection('mysql2')->table('coupons')->get();

            Schema::table('coupons', function () {
                DB::statement('
                SET foreign_key_checks = 0;
            ');
            });

            Coupon::truncate();

            if ($data && count($data) > 0) {
                foreach ($data as $d) {
                    $list = [
                        'id' => $d->id,
                        'name' => ['ar' => $d->name, 'en' => ''],
                        'code' => $d->coupon_code,
                        'value' => $d->coupon_pct,
                        'is_percent' => YES,
                        'minimum_minutes' => $d->minutes,
                        'is_active' => $d->status,
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                        'deleted_at' => $d->deleted_at,

                    ];

                    Coupon::query()->create($list);
                }
            }
            dd('synCoupons');
        } catch (\Exception $exception) {
            dd($exception);
        }
    }

    public function synCategories()
    {
        try {
            $data = DB::connection('mysql2')->table('categories')->get();

            Schema::table('categories', function () {
                DB::statement('
                SET foreign_key_checks = 0;
            ');
            });

            Category::truncate();

            if ($data && count($data) > 0) {
                foreach ($data as $d) {
                    $list = [
                        'id' => $d->id,
                        'name' => ['ar' => $d->title_ar, 'en' => $d->title_en],
                        'fontawesome_icon' => $d->icon,
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                        'deleted_at' => $d->deleted_at,

                    ];

                    Category::query()->create($list);
                }
            }
            dd('synCategories');
        } catch (\Exception $exception) {
            dd($exception);
        }
    }

    public function synWorks()
    {
        try {
            $data = DB::connection('mysql2')->table('works')->get();

            Schema::table('works', function () {
                DB::statement('
                SET foreign_key_checks = 0;
            ');
            });

            Work::truncate();

            if ($data && count($data) > 0) {
                foreach ($data as $d) {
                    $list = [
                        'id' => $d->id,
                        'title' => ['ar' => $d->title_ar, 'en' => $d->title_en],
                        'url' => $d->url,
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                        'deleted_at' => $d->deleted_at,
                    ];

                    Work::query()->create($list);
                }

                Cache::forget('works');
            }
            dd('synWorks');
        } catch (\Exception $exception) {
            dd($exception);
        }
    }

    public function synServices()
    {
        try {
            $data = DB::connection('mysql2')->table('services')->get();

            Schema::table('services', function () {
                DB::statement('
                SET foreign_key_checks = 0;
            ');
            });

            Service::truncate();

            if ($data && count($data) > 0) {
                foreach ($data as $d) {
                    $list = [
                        'id' => $d->id,
                        'title' => ['ar' => $d->name, 'en' => ''],
                        'value' => $d->price,
                        'type' => $d->type,
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                        'deleted_at' => $d->deleted_at,
                    ];

                    Service::query()->create($list);
                }
            }
            dd('synServices');
        } catch (\Exception $exception) {
            dd($exception);
        }
    }

    public function synBanners()
    {
        try {
            $data = DB::connection('mysql2')->table('banners')->get();

            Schema::table('banners', function () {
                DB::statement('
                SET foreign_key_checks = 0;
            ');
            });

            Banner::truncate();

            if ($data && count($data) > 0) {
                foreach ($data as $d) {

                    if (!is_null($d->file) && !empty($d->file)) {
                        $dir = Banner::DIR_BANNER_UPLOADS;
                        $fileName = $d->file;

                        if (File::exists(DIR_UPLOAD . '/' . $dir . '/' . $fileName)) {
                            File::delete(DIR_UPLOAD . '/' . $dir . '/' . $fileName);
                        }

                        copyFilesFromOtherProject($fileName, Banner::DIR_BANNER_UPLOADS);
                    }
                    $list = [
                        'id' => $d->id,
                        'title' => ['ar' => $d->name, 'en' => ''],
                        'description' => ['ar' => $d->details, 'en' => ''],
                        'page' => Banner::$CATEGORIES,
                        'position' => 'top',
                        'image' => $d->file,
                        'is_active' => YES,
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                        'deleted_at' => $d->deleted_at,
                    ];

                    Banner::query()->create($list);
                }
            }
            dd('synBanners');
        } catch (\Exception $exception) {
            dd($exception);
        }
    }

    public function synFaqs()
    {
        try {
            $data = DB::connection('mysql2')->table('faqs')->get();

            Schema::table('faqs', function () {
                DB::statement('
                SET foreign_key_checks = 0;
            ');
            });

            Faq::truncate();

            if ($data && count($data) > 0) {
                foreach ($data as $d) {
                    $list = [
                        'id' => $d->id,
                        'title' => ['ar' => $d->title_ar, 'en' => $d->title_en],
                        'details' => ['ar' => $d->answer_ar, 'en' => $d->answer_en],
                        'sort' => $d->order,
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                        'deleted_at' => $d->deleted_at,
                    ];

                    Faq::query()->create($list);
                }
            }
            dd('synFaqs');
        } catch (\Exception $exception) {
            dd($exception);
        }
    }

    public function synLanguages()
    {
        try {
            $data = DB::connection('mysql2')->table('languages')->get();

            Schema::table('languages', function () {
                DB::statement('
                SET foreign_key_checks = 0;
            ');
            });

            Language::truncate();

            if ($data && count($data) > 0) {
                foreach ($data as $d) {
                    $list = [
                        'id' => $d->id,
                        'name' => ['ar' => $d->title_ar, 'en' => $d->title_en],
                        'code' => $d->code,
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                        'deleted_at' => $d->deleted_at,
                    ];

                    Language::query()->create($list);
                }
            }
            dd('synLanguages');
        } catch (\Exception $exception) {
            dd($exception);
        }
    }

    public function synGuides()
    {
        try {
            $data = DB::connection('mysql2')->table('guides')->get();
            $data2 = DB::connection('mysql2')->table('guides_comments')->get();
            $data3 = DB::connection('mysql2')->table('guides_downloads')->get();

            Schema::table('guides', function () {
                DB::statement('SET foreign_key_checks = 0;');
            });
            Schema::table('guides_comments', function () {
                DB::statement('SET foreign_key_checks = 0;');
            });
            Schema::table('guides_downloads', function () {
                DB::statement('SET foreign_key_checks = 0;');
            });


            Guide::truncate();
            GuideComment::truncate();
            GuideDownload::truncate();

            if ($data && count($data) > 0) {
                foreach ($data as $d) {

                    if (!is_null($d->file) && !empty($d->file)) {
                        $fileName = $d->file;
                        $dir = Guide::DIR_GUIDE_UPLOADS;
                        if (File::exists(DIR_UPLOAD . '/' . $dir . '/' . $fileName)) {
                            File::delete(DIR_UPLOAD . '/' . $dir . '/' . $fileName);
                        }
                        copyFilesFromOtherProject($fileName, Guide::DIR_GUIDE_UPLOADS);
                    }

                    if (!is_null($d->image) && !empty($d->image)) {
                        $fileName = $d->image;
                        $dir = Guide::DIR_GUIDE_UPLOADS;
                        if (File::exists(DIR_UPLOAD . '/' . $dir . '/' . $fileName)) {
                            File::delete(DIR_UPLOAD . '/' . $dir . '/' . $fileName);
                        }
                        copyFilesFromOtherProject($fileName, Guide::DIR_GUIDE_UPLOADS);
                    }


                    $list = [
                        'id' => $d->id,
                        'name' => ['ar' => $d->name, 'en' => ''],
                        'details' => $d->details,
                        'image' => $d->image,
                        'file' => $d->file,
                        'unit_price' => $d->price > 0 ? $d->price : 0,
                        'evaluation_rate' => $d->rating,
                        'type' => $d->type,
                        'number_of_likes' => $d->likes,
                        //'number_of_comments' => ,
                        'number_of_downloads' => $d->downloads,
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                        'deleted_at' => $d->deleted_at,
                    ];

                    Guide::query()->create($list);
                }
            }

            if ($data2 && count($data2) > 0) {
                foreach ($data2 as $d) {
                    $list = [
                        'id' => $d->id,
                        'name' => $d->name,
                        'email' => $d->email,
                        'details' => $d->details,
                        'status' => $d->status,
                        'guide_id' => $d->guide_id,
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                    ];
                    GuideComment::query()->create($list);
                }
            }

            if ($data3 && count($data3) > 0) {
                foreach ($data3 as $d) {
                    $list = [
                        'id' => $d->id,
                        'guide_id' => $d->guide_id,
                        'order_id' => null,
                        'user_id' => $d->user_id,
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                    ];
                    GuideDownload::query()->create($list);
                }
            }

            dd('synGuides');
        } catch (\Exception $exception) {
            dd($exception);
        }
    }

    public function synDialects()
    {
        try {
            $data = DB::connection('mysql2')->table('dialects')->get();

            Schema::table('dialects', function () {
                DB::statement('SET foreign_key_checks = 0;');
            });


            Dialect::truncate();

            if ($data && count($data) > 0) {
                foreach ($data as $d) {
                    $list = [
                        'id' => $d->id,
                        'name' => ['ar' => $d->title_ar, 'en' => $d->title_en],
                        'language_id' => $d->language_id,
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                        'deleted_at' => $d->deleted_at,
                    ];

                    Dialect::query()->create($list);
                }
            }


            dd('synDialects');
        } catch (\Exception $exception) {
            dd($exception);
        }
    }

    public function synPartners()
    {
        try {
            $data = DB::connection('mysql2')->table('partners')->get();

            Schema::table('partners', function () {
                DB::statement('SET foreign_key_checks = 0;');
            });


            Partner::truncate();

            if ($data && count($data) > 0) {
                foreach ($data as $d) {
                    $image = DB::connection('mysql2')->table('media')
                        ->Where('model_id', $d->id)
                        ->Where('model_type', Partner::class)
                        ->first();


                    if (!is_null($image->file_name) && !empty($image->file_name)) {
                        $fileName = $image->file_name;
                        $dir = Partner::DIR_PARTNERS_UPLOADS;
                        if (File::exists(DIR_UPLOAD . '/' . $dir . '/' . $fileName)) {
                            File::delete(DIR_UPLOAD . '/' . $dir . '/' . $fileName);
                        }
                        copyFilesFromOtherProject($fileName, Partner::DIR_PARTNERS_UPLOADS);
                    }


                    $list = [
                        'id' => $d->id,
                        'image' => $image ? $image->file_name : null,
                        'full_name' => ['ar' => $d->title_ar, 'en' => $d->title_en],
                        'description' => ['ar' => $d->text_ar, 'en' => $d->text_en],
                        'job_title' => ['ar' => $d->job_title_ar, 'en' => $d->job_title_en],
                        'alt' => ['ar' => $d->alt_text_ar, 'en' => $d->alt_text_en],
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                        'deleted_at' => $d->deleted_at,
                    ];

                    Partner::query()->create($list);
                }
            }

            dd('synPartners');
        } catch (\Exception $exception) {
            dd($exception);
        }
    }

    public function synArticles()
    {
        try {
            $data = DB::connection('mysql2')->table('articles')->get();

            Schema::table('articles', function () {
                DB::statement('SET foreign_key_checks = 0;');
            });


            Article::truncate();

            if ($data && count($data) > 0) {
                foreach ($data as $d) {
                    $image = DB::connection('mysql2')->table('media')
                        ->Where('model_id', $d->id)
                        ->Where('model_type', Article::class)
                        ->Where('collection_name', 'image')
                        ->first();
                    $photo = DB::connection('mysql2')->table('media')
                        ->Where('model_id', $d->id)
                        ->Where('model_type', Article::class)
                        ->Where('collection_name', 'photo')
                        ->first();

                    if (isset($image->file_name) && !is_null($image->file_name) && !empty($image->file_name)) {
                        $fileName = $image->file_name;
                        $dir = Article::DIR_ARTICLES_UPLOADS;
                        if (File::exists(DIR_UPLOAD . '/' . $dir . '/' . $fileName)) {
                            File::delete(DIR_UPLOAD . '/' . $dir . '/' . $fileName);
                        }
                        copyFilesFromOtherProject($fileName, Article::DIR_ARTICLES_UPLOADS);
                    }


                    if (isset($photo->file_name) && !is_null($photo->file_name) && !empty($photo->file_name)) {
                        $fileName = $photo->file_name;
                        $dir = Article::DIR_ARTICLES_UPLOADS;
                        if (File::exists(DIR_UPLOAD . '/' . $dir . '/' . $fileName)) {
                            File::delete(DIR_UPLOAD . '/' . $dir . '/' . $fileName);
                        }
                        copyFilesFromOtherProject($fileName, Article::DIR_ARTICLES_UPLOADS);
                    }

                    $list = [
                        'id' => $d->id,
                        'video_url' => $d->video_url,
                        'title' => ['ar' => $d->title_ar, 'en' => $d->title_en],
                        'short_description' => ['ar' => $d->short_text_ar, 'en' => $d->short_text_en],
                        'content' => ['ar' => $d->content_ar, 'en' => $d->content_en],
                        'meta_description' => ['ar' => $d->meta_description_ar, 'en' => $d->meta_description_en],
                        'meta_keywords' => ['ar' => $d->key_words_ar, 'en' => $d->key_words_en],
                        'internal_image' => ($photo) ? $photo->file_name : null,
                        'external_image' => $image ? $image->file_name : null,
                        'status' => 2,
                        'read_count' => $d->read_count,
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                        'deleted_at' => $d->deleted_at,
                    ];

                    Article::query()->create($list);
                }
            }

            dd('synArticles');
        } catch (\Exception $exception) {
            dd($exception);
        }
    }

    public function synClients()
    {
        try {

            Schema::table('users', function () {
                DB::statement('SET foreign_key_checks = 0;');
            });
            Schema::table('auth_service_providers', function () {
                DB::statement('SET foreign_key_checks = 0;');
            });
            Schema::table('user_profile', function () {
                DB::statement('SET foreign_key_checks = 0;');
            });


            DB::transaction(function () {

                AuthServiceProvider::query()->forceDelete();

                UserWorkField::query()->forceDelete();

                User::withTrashed()->whereNull('role_id')->forceDelete();

                $data = DB::connection('mysql2')->table('clients')->get();

                if ($data && count($data) > 0) {

                    DB::connection('mysql2')
                        ->table('clients')
                        ->orderBy('id')
                        ->chunk(500, function ($clients) {
                            foreach ($clients as $d) {

                                if (strpos($d->image, 'assets/') === 0) {
                                    $image = str_replace('assets/', '', $d->image);

                                    if (!is_null($image) && !empty($image)) {
                                        $fileName = $image;
                                        $dir = User::DIR_IMAGE_UPLOADS;
                                        if (File::exists(DIR_UPLOAD . '/' . $dir . '/' . $fileName)) {
                                            File::delete(DIR_UPLOAD . '/' . $dir . '/' . $fileName);
                                        }
                                        copyFilesFromOtherProject($fileName, User::DIR_IMAGE_UPLOADS);
                                    }

                                } else {
                                    $image = $d->image;
                                }


                                $isUser = User::withTrashed()->where('email', $d->email)->first();

                                $list = [
                                    'id' => $d->id,
                                    'full_name' => $d->name,
                                    'email' => $d->email,
                                    'password' => $d->password,
                                    'mobile' => $d->phone,
                                    'image' => $image,
                                    'user_type_id' => is_null($d->actors_id) ? UserType::CLIENT : UserType::VOICE_ACTOR,
                                    'status_id' => UserStatus::ACCEPTED,
                                    'uniq_id' => generate_uniq_id(),
                                    'created_at' => $d->created_at,
                                    'updated_at' => $d->updated_at,
                                    'deleted_at' => $d->deleted_at,
                                ];


                                if ($isUser) {

                                    if (is_null($isUser->deleted_at)) {

                                        if (is_null($d->deleted_at)) {
                                            unset($list['id']);
                                            unset($list['email']);
                                            User::query()->where('email', $d->email)->update($list);
                                        } else {
                                            $list['email'] = uniqid() . '_' . $list['email'];
                                            $list['mobile'] = uniqid() . '_' . $list['mobile'];
                                            User::query()->create($list);
                                        }

                                    } else {
                                        $isUser->email = uniqid() . '_' . $list['email'];
                                        $isUser->mobile = uniqid() . '_' . $list['mobile'];
                                        $isUser->save();

                                        User::query()->create($list);
                                    }

                                    $user = User::withTrashed()->where('email', $d->email)->first();

                                    //$user = User::query()->create($list);

                                } else {
                                    $user = User::query()->create($list);
                                }

                                $country = Country::where('name->ar', $d->country)->first();


                                $isProfile = UserProfile::query()->where('user_id', $user->id)->first();

                                $hours = 0;
                                $gender = null;
                                if (!is_null($d->actors_id)) {
                                    $client = DB::connection('mysql2')->table('voice_actors')
                                        ->where('id', $d->actors_id)
                                        ->first();
                                    $hours = $client->hour_price;
                                    $gender = $client->gender;
                                }
                                $profile = [
                                    'user_id' => $user->id,
                                    'country_id' => $country ? $country->id : null,
                                    'whatsapp_number' => $d->whatspp,
                                    'price_per_minute' => $d->mint_price,
                                    'price_per_hours' => $hours,
                                    'gender_id' => $gender,
                                    'business_link' => $d->link,
                                ];

                                if ($isProfile) {
                                    UserProfile::query()->where('user_id', $user->id)->update($profile);
                                } else {
                                    UserProfile::query()->create($profile);
                                }


                                if (!is_null($d->provider_id)) {
                                    $userProvider = AuthServiceProvider::where('user_id', $d->id)->first();

                                    if (!$userProvider) {
                                        AuthServiceProvider::create([
                                            'user_id' => $user->id,
                                            'auth_service_name' => 'google',
                                            'auth_service_image' => $d->avatar,
                                            'auth_service_id' => $d->provider_id,
                                            'updated_at' => null,
                                        ]);
                                    }
                                }

                                if (is_null($d->actors_id)) {
                                    $works = DB::connection('mysql2')->table('clients_working')
                                        ->where('client_id', $user->id)
                                        ->get();

                                    if (count($works) > 0) {
                                        foreach ($works as $work) {
                                            $isWork = UserWorkField::where([
                                                'user_id' => $user->id,
                                                'work_field_id' => $work->id,
                                            ])->first();

                                            if (!$isWork) {
                                                UserWorkField::insert([
                                                    'id' => $work->id,
                                                    'user_id' => $user->id,
                                                    'work_field_id' => $work->id,
                                                ]);
                                            }
                                        }
                                    }
                                }


                                if (!is_null($d->actors_id)) {
                                    $languages = DB::connection('mysql2')->table('language_voice_actor')
                                        ->where('voice_actor_id', $d->actors_id)
                                        ->get();


                                    if (count($languages) > 0) {
                                        foreach ($languages as $language) {

                                            $isLanguage = UserLanguage::where([
                                                'user_id' => $user->id,
                                                'language_id' => $language->language_id,
                                            ])->first();

                                            if (!$isLanguage)
                                                UserLanguage::insert([
                                                    'user_id' => $user->id,
                                                    'language_id' => $language->language_id,
                                                ]);
                                        }
                                    }
                                }

                            }
                        });


                }
            });

            dd('synClients');
        } catch (\Exception $exception) {
            dd($exception);
        }
    }

    public function synVoiceActors()
    {
        try {
            Schema::table('users', function () {
                DB::statement('SET foreign_key_checks = 0;');
            });
            Schema::table('auth_service_providers', function () {
                DB::statement('SET foreign_key_checks = 0;');
            });
            Schema::table('user_profile', function () {
                DB::statement('SET foreign_key_checks = 0;');
            });


            DB::transaction(function () {

                AuthServiceProvider::whereHas('user', function ($q) {
                    $q->withTrashed()->Where('user_type_id', UserType::VOICE_ACTOR);
                })->forceDelete();

                UserWorkField::query()->whereHas('user', function ($q) {
                    $q->withTrashed()->where('user_type_id', UserType::VOICE_ACTOR);
                })->forceDelete();

                UserLanguage::query()->forceDelete();

                User::withTrashed()->where('user_type_id', UserType::VOICE_ACTOR)->forceDelete();


                $data = DB::connection('mysql2')->table('voice_actors')->get();

                if ($data && count($data) > 0) {
                    foreach ($data as $d) {

                        $client = DB::connection('mysql2')->table('clients')
                            ->where('actors_id', $d->id)
                            ->first();

                        $image = null;
                        if ($client) {
                            if (strpos($client->image, 'assets/') === 0) {
                                $image = str_replace('assets/', '', $client->image);

                                if (!is_null($image) && !empty($image)) {
                                    $fileName = $image;
                                    $dir = User::DIR_IMAGE_UPLOADS;
                                    if (File::exists(DIR_UPLOAD . '/' . $dir . '/' . $fileName)) {
                                        File::delete(DIR_UPLOAD . '/' . $dir . '/' . $fileName);
                                    }
                                    copyFilesFromOtherProject($fileName, User::DIR_IMAGE_UPLOADS);
                                }

                            } else {
                                $image = $client->image;
                            }
                        }


                        $isUser = User::withTrashed()->where('email', $d->email)->first();

                        if ($client) {
                            $list = [
                                'id' => $client->id,
                                'full_name' => ['ar' => $d->title_ar, 'en' => $d->title_en],
                                'email' => $d->email,
                                'image' => $image,
                                'password' => $client ? $client->password : null,
                                'mobile' => $d->mobile,
                                'user_type_id' => UserType::VOICE_ACTOR,
                                'status_id' => UserStatus::ACCEPTED,
                                'uniq_id' => generate_uniq_id(),
                                'created_at' => $d->created_at,
                                'updated_at' => $d->updated_at,
                                'deleted_at' => $d->deleted_at,
                            ];


                            if ($isUser) {
                                $list['email'] = is_null($d->email) ? null : uniqid() . '_' . $d->email;
                                $user = User::query()->create($list);

                            } else {
                                $user = User::query()->create($list);
                            }
                        }


                        $country = Country::where('name->ar', $d->country)->first();

                        $isProfile = UserProfile::query()->where('user_id', $user->id)->first();

                        $profile = [
                            'user_id' => $user->id,
                            'country_id' => $country ? $country->id : null,
                            'whatsapp_number' => $d->mobile,
                            'price_per_minute' => $d->mint_price,
                            'price_per_hours' => $d->hour_price,
                            'gender_id' => $d->gender,
                            'business_link' => $d->link,
                        ];

                        if ($isProfile) {
                            UserProfile::query()->where('user_id', $user->id)->update($profile);
                        } else {
                            UserProfile::query()->create($profile);
                        }

                        if ($client && !is_null($client->provider_id)) {
                            $userProvider = AuthServiceProvider::where('user_id', $d->id)->first();


                            if (!$userProvider) {
                                if ($client) {
                                    AuthServiceProvider::create([
                                        'user_id' => $user->id,
                                        'auth_service_name' => 'google',
                                        'auth_service_image' => $client ? $client->avatar : null,
                                        'auth_service_id' => $client ? $client->provider_id : null,
                                        'updated_at' => null,
                                    ]);
                                }

                            }
                        }

                        $languages = DB::connection('mysql2')->table('language_voice_actor')
                            ->where('voice_actor_id', $d->id)
                            ->get();


                        if (count($languages) > 0) {
                            foreach ($languages as $language) {

                                if ($client) {
                                    $isLanguage = UserLanguage::where([
                                        'user_id' => $client->id,
                                        'language_id' => $language->language_id,
                                    ])->first();

                                    if (!$isLanguage)
                                        UserLanguage::insert([
                                            'user_id' => $client->id,
                                            'language_id' => $language->language_id,
                                        ]);
                                }
                            }
                        }


                    }


                }
            });

            dd('synVoiceActors');
        } catch (\Exception $exception) {
            dd($exception);
        }
    }

    public function synVoicesAndSamples()
    {
        try {
            $data = DB::connection('mysql2')->table('voices')->get();
            $data2 = DB::connection('mysql2')->table('category_voice')->get();

            Schema::table('voices', function () {
                DB::statement('SET foreign_key_checks = 0;');
            });


            Voice::truncate();
            VoiceCategory::truncate();

            if ($data && count($data) > 0) {
                foreach ($data as $d) {
                    $file = DB::connection('mysql2')->table('media')
                        ->Where('model_id', $d->id)
                        ->Where('model_type', Voice::class)
                        ->Where('collection_name', 'file')
                        ->first();

                    $lang = Dialect::query()->find($d->dialect_id);

//                    $client = DB::connection('mysql2')->table('clients')
//                        ->Where('actors_id', $d->voice_actor_id)
//                        ->first();

                    $client = DB::connection('mysql2')->table('voice_actors')
                        ->Where('id', $d->voice_actor_id)
                        ->first();

                    if ($client) {
                        $client = getUserByName($client->title_ar, $client->title_en);
                    }
//                    if (isset($file) && !is_null($file->file_name) && !empty($file->file_name)) {
//                        $fileName = $file->file_name;
//                        $dir = Voice::DIR_VOICES_UPLOADS;
//                        if (File::exists(DIR_UPLOAD . '/' . $dir . '/' . $fileName)) {
//                            File::delete(DIR_UPLOAD . '/' . $dir . '/' . $fileName);
//                        }
//                        copyFilesFromOtherProject($fileName, Voice::DIR_VOICES_UPLOADS);
//                    }

                    $list = [
                        'id' => $d->id,
                        'title' => ['ar' => $d->title_ar, 'en' => $d->title_en],
                        'voice_type_id' => $d->type,
                        'price_per_minute' => $d->mint_price,
                        'number_of_likes' => $d->likes_count,
                        'number_of_listened' => $d->listin_count,
                        'number_of_orders' => $d->requests_count,
                        'voiceover_id' => $client ? $client->id : null,
                        'dialect_id' => $d->dialect_id,
                        'voice_status_id' => VoiceStatus::ACCEPTED,
                        'meta_description' => ['ar' => $d->meta_description, 'en' => $d->meta_description],
                        'meta_title' => ['ar' => $d->meta_title, 'en' => $d->meta_title],
                        'total_price' => $d->mint_price,
                        'is_sample' => is_null($d->sample_id) ? null : YES,
                        'language_id' => $lang ? $lang->language_id : null,
                        'audio_file' => $file ? $file->file_name : null,
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                        'deleted_at' => $d->deleted_at,
                    ];

                    $voice = Voice::query()->create($list);
                }
            }

            if ($data2 && count($data2) > 0) {
                foreach ($data2 as $d) {
                    VoiceCategory::insert([
                        'voice_id' => $d->voice_id,
                        'category_id' => $d->category_id,
                    ]);
                }
            }
            dd('synVoices');
        } catch (\Exception $exception) {
            dd($exception);
        }
    }

    public function synFavorites()
    {
        try {
            $data = DB::connection('mysql2')->table('favorites')->get();

            Schema::table('favorites', function () {
                DB::statement('SET foreign_key_checks = 0;');
            });


            Favorite::truncate();

            if ($data && count($data) > 0) {
                foreach ($data as $d) {

                    $list = [
                        'id' => $d->id,
                        'voice_id' => $d->voice_id,
                        'user_id' => $d->client_id,
                    ];

                    Favorite::query()->create($list);
                }
            }

            dd('synFavorites');
        } catch (\Exception $exception) {
            dd($exception);
        }
    }

    public function synOrders()
    {
        try {
            $data = DB::connection('mysql2')->table('reservations')->get();

            Schema::table('orders', function () {
                DB::statement('SET foreign_key_checks = 0;');
            });
            Schema::table('user_ratings', function () {
                DB::statement('SET foreign_key_checks = 0;');
            });
            Schema::table('order_items', function () {
                DB::statement('SET foreign_key_checks = 0;');
            });
            Schema::table('order_item_details', function () {
                DB::statement('SET foreign_key_checks = 0;');
            });
            Schema::table('transactions', function () {
                DB::statement('SET foreign_key_checks = 0;');
            });

            Order::truncate();
            OrderItem::truncate();
            OrderItemDetail::truncate();
            Transaction::truncate();
            UserRating::truncate();

            if ($data && count($data) > 0) {
                foreach ($data as $d) {

                    $clientOldDatabase = DB::connection('mysql2')->table('clients')
                        ->where('actors_id', $d->voiceactor_id)
                        ->first();

                    $voiceActoreNewDatabase = null;

                    if ($clientOldDatabase)
                        $voiceActoreNewDatabase = User::find($clientOldDatabase->id);

                    $discount_value = null;
                    if ($d->coupon_pct) {
                        $discount_value = calculateValueFromPercentage($d->real_price, $d->coupon_pct);
                    }


                    $status = 0;

                    if ($d->status == 1) {
                        $status = OrderStatus::IN_PROGRESS;
                    }
                    if ($d->status == 2) {
                        $status = OrderStatus::COMPLETED;
                    }
                    if ($d->status == 3) {
                        $status = OrderStatus::CANCELED;
                    }


                    $voice = Voice::with('dialect', 'language', 'categories.category', 'category')->find($d->voice_id);

                    $listOfPrice = [
                        'subTotal' => $d->mint_price,
                        'total' => $d->total_price,
                        'paymentCommission' => [
                            'id' => 1,
                            'value' => 0,
                            'percentage' => 0,
                        ],
                        'platFormCommission' => [
                            'value' => 0,
                            'percentage' => 0,
                        ],
                        'services' => $d->total_price,
                        'script' => [
                            'total' => $d->total_price,
                            'subTotal' => $d->mint_price,
                            'voice' => $voice,
                            'scenario' => $d->scenario,
                            'numberOfWords' => $d->word_count,
                            'pricePerMinute' => $d->mint_price,
                            'numberOfMinutes' => $d->mint_count,
                            'platFormCommission' => [
                                'value' => 0,
                                'percentage' => 0,
                            ],
                        ],
                    ];


                    $list = [
                        'id' => $d->id,
                        'customer_id' => $d->client_id,
                        'voice_actor_id' => $voiceActoreNewDatabase ? $voiceActoreNewDatabase->id : null,
                        'customer_email' => $d->email,
                        'customer_phone' => $d->whatsapp_number,
                        'customer_full_name' => $d->name,
                        'coupon_id' => $d->coupon_id,
                        'discount_percentage' => $d->coupon_pct,
                        'discount_value' => $discount_value,
                        'total' => is_null($d->deleted_at) && !empty($d->total_price) ? $d->total_price : 0,
                        'note' => $d->note_for_actor,
                        'currency_id' => CurrencyHelper::getId(),
                        'order_type_id' => OrderType::BOOKING_VOICE,
                        'payment_method_id' => PaymentMethod::STRIPE,
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                        'deleted_at' => $d->deleted_at,
                        'billing_full_name' => $d->name,
                        'payment_method_percentage' => null,
                        'payment_method_value' => null,
                        'is_old' => YES,
                        'sub_total' => is_null($d->total_price) && !empty($d->total_price) ? $d->total_price : 0,
                        'list_of_price' => json_encode($listOfPrice),
                        'status_id' => $status,
                    ];


                    $order = Order::query()->create($list);

                    $services = DB::connection('mysql2')->table('reservation_services')
                        ->Where('reservation_id', $d->id)
                        ->get();


                    $orderItem = OrderItem::create([
                        'order_id' => $order->id,
                        'itemable_id' => is_null($d->voice_id) ? -1 : $d->voice_id,
                        'itemable_type' => Voice::class,
                        'unit_price' => $d->mint_price > 0 ? $d->mint_price : 0,
                        'item' => $order->scenario,
                        'notes' => $order->note_for_actor,
                        'line_total' => !empty($d->total_price) ? $d->total_price : 0,
                        'created_at' => $d->created_at,
                        'updated_at' => $d->updated_at,
                    ]);

                    OrderItemDetail::create([
                        'item_id' => $orderItem->id,
                        'category_id' => $d->category_id,
                        'language_id' => $d->language_id,
                        'dialect_id' => $d->dialect_id,
                        'voice_type_id' => $d->type,
                        'voice_audio_file' => $orderItem->id,
                        'notes' => $orderItem->id,
                        'word_count' => !is_null($d->word_count) && !empty($d->word_count) ? $d->word_count : 0,
                        'number_of_minutes' => !is_null($d->mint_count) && !empty($d->mint_count) ? $d->mint_count : 0,
                    ]);

                    if ($services && count($services) > 0) {
                        foreach ($services as $service) {
                            $serviceName = Service::where('id', $service->service_id)->first();

                            $orderItem = OrderItem::create([
                                'order_id' => $order->id,
                                'itemable_id' => $service->service_id,
                                'itemable_type' => Service::class,
                                'unit_price' => $service->price,
                                'item' => $serviceName ? $serviceName->title : null,
                                'line_total' => !empty($service->price) ? $service->price : 0,
                                'created_at' => $d->created_at,
                                'updated_at' => $d->updated_at,
                                //'deleted_at' => $d->deleted_at,
                            ]);

                            OrderItemDetail::create([
                                'item_id' => $orderItem->id,
                                'voice_audio_file' => $orderItem->id,
                                'voice_type_id' => $d->type,
                                'word_count' => $d->word_count,
                                'number_of_minutes' => $d->mint_count,
                            ]);
                        }
                    }

                    if ($d->is_paid == 1) {
                        Transaction::create([
                            'order_id' => $order->id,
                            'transaction_id' => $d->invoice_id ? $d->invoice_id : -1,
                            'methodable_id' => $order->payment_method_id,
                            'methodable_type' => PaymentMethod::class,
                            'transaction_type_id' => TransactionType::BOOKING,
                            'response' => null,
                            'description' => null,
                            'payer_id' => $d->client_id,
                            'payee_id' => $voiceActoreNewDatabase ? $voiceActoreNewDatabase->id : null,
                            'amount_paid' => $d->total_price > 0 ? $d->total_price : 0,
                            'transaction_fee' => 0,
                            'transaction_status_id' => TransactionStatus::SUCCEEDED,
                            'currency_id' => CurrencyHelper::getId(),
                        ]);
                    }

                    if (!is_null($d->opinion_of_work)) {
                        $group = RatingGroup::where('is_active', 1)->first();

                        $criterias = [
                            [
                                'id' => 1,
                                'value' => $d->quality_recordings,
                                'index' => 0,
                            ],
                            [
                                'id' => 2,
                                'value' => $d->level_performance,
                                'index' => 1,
                            ],
                            [
                                'id' => 3,
                                'value' => $d->delivery_speed,
                                'index' => 2,
                            ],
                        ];


                        UserRating::create([
                            'order_id' => $order->id,
                            'voice_actor_id' => isset($voiceActoreNewDatabase->id) ? $voiceActoreNewDatabase->id : null,
                            'group_id' => $group->id,
                            'client_response' => $d->opinion_of_work,
                            'client_criterias' => json_encode($criterias),
                            'client_average' => round(($d->quality_recordings + $d->level_performance + $d->delivery_speed) / 3, 1),
                        ]);
                    }
                    //reservation_file
                }
            }

            dd('synOrders');
        } catch (\Exception $exception) {
            dd($exception);
        }
    }

    public function generateWallet()
    {
        $data = User::get();

        Schema::table('wallets', function () {
            DB::statement('SET foreign_key_checks = 0;');
        });


        Wallet::query()->truncate();
        foreach ($data as $user) {
            WalletHelper::create($user->id);
        }

        dd('generateWallet');

    }

    public function synProfits()
    {

        Schema::table('transactions', function () {
            DB::statement('SET foreign_key_checks = 0;');
        });

        $data = DB::connection('mysql2')->table('profits')->get();


        Transaction::query()->where('transaction_type_id', TransactionType::WITHDRAW_PROFITS)->delete();


        foreach ($data as $d) {
            $voiceActore = DB::connection('mysql2')->table('clients')->where('actors_id', $d->voiceactors_id)->first();

            if ($d->payment_way == 'بنكي') {
                $withdrawal_method = WithdrawalMethod::ACCOUNT_BANK;
            }
            if ($d->payment_way == 'باي بال') {
                $withdrawal_method = WithdrawalMethod::PAYPAL;
            }
            if ($d->payment_way == 'فودافون كاش') {
                $withdrawal_method = WithdrawalMethod::VODAFONE_CASH;
            }
            if ($d->payment_way == 'حوالة مكتبية') {
                $withdrawal_method = WithdrawalMethod::OFFICE_TRANSFER;
            }

            Transaction::create([
                'transaction_id' => uniqid(),
                'methodable_id' => $withdrawal_method,
                'methodable_type' => WithdrawalMethod::class,
                'transaction_type_id' => TransactionType::WITHDRAW_PROFITS,
                'payee_id' => $voiceActore->id,
                'amount_paid' => $d->amount,
                'transaction_status_id' => TransactionStatus::SUCCEEDED,
                'currency_id' => CurrencyHelper::getId(),
                'receipt' => $d->file,
                'created_at' => $d->created_at,
                'updated_at' => $d->updated_at,
                'deleted_at' => $d->deleted_at,
            ]);
        }

        dd('synProfits');

    }

    public function synSiteSetting()
    {
        $data = DB::connection('mysql2')->table('site_settings')->first();

        if (isset($data->title_ar) || isset($data->title_en)) {
            $website_name = getSetting('website_name');
            if (!$website_name) {
                if ($data->title_ar) {
                    $n['ar'] = $data->title_ar;
                }
                if ($data->title_en) {
                    $n['en'] = $data->title_en;
                }
                Setting::create(['key' => 'website_name', 'value' => $n]);
            }
        }
        if (isset($data->mobile)) {
            $mobile_1 = getSetting('mobile_1');
            if (!$mobile_1) {
                if ($data->mobile) {
                    Setting::create(['key' => 'mobile_1', 'value' => $data->mobile]);
                }
            }
        }
        if (isset($data->email)) {
            $key = 'email';
            $value = $data->email;

            $email = getSetting($key);
            if (!$email) {
                if ($data->email) {
                    Setting::create(['key' => $key, 'value' => $value]);
                }
            }
        }
        if (isset($data->description_en) || isset($data->description_ar)) {
            $key = 'meta_description';
            $meta_description = getSetting($key);
            if (!$meta_description) {
                if ($data->description_ar) {
                    $value['ar'] = $data->description_ar;
                }
                if ($data->description_en) {
                    $value['en'] = $data->description_en;
                }
                Setting::create(['key' => $key, 'value' => $value]);
            }
        }

        if (isset($data->key_words_ar) || isset($data->key_words_en)) {
            $key = 'meta_keyword';
            $meta_description = getSetting($key);
            if (!$meta_description) {
                if ($data->key_words_ar) {
                    $value['ar'] = $data->key_words_ar;
                }
                if ($data->key_words_en) {
                    $value['en'] = $data->key_words_en;
                }
                Setting::create(['key' => $key, 'value' => $value]);
            }
        }

        if (isset($data->site_footer)) {
            $key = 'footer_about_site';
            $meta_description = getSetting($key);
            if (!$meta_description) {
                if ($data->site_footer) {
                    $value['ar'] = $data->site_footer;
                    $value['en'] = $data->site_footer;
                }
                Setting::create(['key' => $key, 'value' => $value]);
            }
        }

        dd('synSettings');

    }


    public function synPages()
    {
        $data = DB::connection('mysql2')->table('site_settings')->first();


        if (isset($data->training_title) || isset($data->training_details)) {
            $training = Page::where('slug', Page::TRAINING)->first();


            if (isset($data->training_title)) {
                $title['ar'] = $data->training_title;
                $title['en'] = $data->training_title;
            }
            if (isset($data->training_details)) {
                $content['ar'] = $data->training_details;
                $content['en'] = $data->training_details;
            }

            if (!$training) {
                $training = new Page();
            }

            $training->title = $title;
            $training->slug = Page::TRAINING;
            $training->content = $content;
            $training->save();
        }

        if (isset($data->terms_title) || isset($data->terms_details)) {

            $terms = Page::where('slug', Page::TERMS_OF_USE)->first();

            if (isset($data->terms_title)) {
                $title['ar'] = $data->terms_title;
                $title['en'] = $data->terms_title;
            }
            if (isset($data->terms_details)) {
                $content['ar'] = $data->terms_details;
                $content['en'] = $data->terms_details;
            }

            if (!$terms) {
                $terms = new Page();
            }
            $terms->content = $content;
            $terms->save();
        }


        if (isset($data->title_aboutus_ar) || isset($data->title_aboutus_en)) {
            $about = Page::where('slug', Page::ABOUT_US)->first();

            if (!$about) {
                $about = new Page();
            }

            if (isset($data->title_aboutus_ar)) {
                $title['ar'] = $data->title_aboutus_ar;
            }
            if (isset($data->title_aboutus_en)) {
                $title['ar'] = $data->title_aboutus_en;
            }

            if (isset($data->description_aboutus_ar) || isset($data->description_aboutus_ar)) {
                if (isset($data->description_aboutus_ar)) {
                    $content['ar'] = $data->description_aboutus_ar;
                }
                if (isset($data->description_aboutus_ar)) {
                    $content['ar'] = $data->description_aboutus_ar;
                }
            }


            $about->title = $title;
            $about->content = $content;
            $about->slug = Page::ABOUT_US;
        }


        $about->save();

        dd('synPages');

    }

    public function updateNameUsers()
    {
        $users = User::whereIn('user_type_id', [UserType::VOICE_ACTOR, UserType::CLIENT])->get();

        //   dd($users[5]);
        foreach ($users as $user) {
            $u = $user->getAttributes()['full_name'];
            $decoded = json_decode($u, true);

            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                continue;
            } else {
                $user->update(['full_name' => ['ar' => $u]]);
            }

        }
    }

    public function addMissingVoiceOversTheVoiceTable()
    {

        DB::transaction(function () {
            $currentVoices = Voice::with('voiceOver')->get();


            foreach ($currentVoices as $in => $cVoice) {


                $oldVoice = DB::connection('mysql2')
                    ->table('voices')
                    ->where('id', $cVoice->id)
                    ->first();

                if (!$oldVoice) {
                    Log::channel('update')->info("The OldVoice: ({$cVoice->id}) not found.");
                    continue;
                }

                $oldVoiceActor = DB::connection('mysql2')->table('voice_actors')->where('id', $oldVoice->voice_actor_id)->first();

                if (!$oldVoiceActor) {
                    Log::channel('update')->info("OldVoiceActor the voice: ({$cVoice->id}) not found.");
                    continue;
                }
                $isUser = null;
                if (!is_null($oldVoiceActor->email)) {
                    $isUser = User::withTrashed()->where('email', $oldVoiceActor->email)->first();
                }
                if (!$isUser && !is_null($oldVoiceActor->mobile)) {
                    $isUser = User::withTrashed()->where('mobile', $oldVoiceActor->mobile)->first();
                }

                if ($isUser) {
                    $newUser = User::withoutTrashed()->where('email', $isUser->email)->orwhere('mobile', $isUser->mobile)
                        ->where('user_type_id', UserType::VOICE_ACTOR)
                        ->first();

                    if (!$newUser) {
                        Log::channel('update')->info("OldVoiceActor :($oldVoiceActor->id) the voice: ({$cVoice->id})  found but newUser not found");
                        continue;
                    }

                    $cVoice->voiceover_id = $newUser->id;
                    $cVoice->save();

                } else {

                    Log::channel('update')->info("User not found  the voice: ({$cVoice->id}) and Actor : $oldVoiceActor->id");

                    $textAr = $oldVoiceActor->title_ar;
                    $textEn = $oldVoiceActor->title_en;

                    $checkUser = getUserByName($textAr, $textEn);

                    if (!$checkUser) {

                        $newUser = User::create([
                            'full_name' => ['ar' => $oldVoiceActor->title_ar, 'en' => $oldVoiceActor->title_en],
                            'email' => $oldVoiceActor->email,
                            'mobile' => $oldVoiceActor->mobile,
                            'user_type_id' => UserType::VOICE_ACTOR,
                            'status_id' => UserStatus::ACCEPTED,
                            'uniq_id' => generate_uniq_id(),
                            'created_at' => $oldVoiceActor->created_at,
                            'updated_at' => $oldVoiceActor->updated_at,
                            'deleted_at' => $oldVoiceActor->deleted_at,
                        ]);

                        $country = Country::where('name->ar', $oldVoiceActor->country)->first();

                        UserProfile::create([
                            'user_id' => $newUser->id,
                            'country_id' => $country ? $country->id : null,
                            'whatsapp_number' => $oldVoiceActor->mobile,
                            'price_per_minute' => $oldVoiceActor->mint_price,
                            'price_per_hours' => $oldVoiceActor->hour_price,
                            'gender_id' => $oldVoiceActor->gender,
                            'business_link' => $oldVoiceActor->link,
                        ]);

                        WalletHelper::create($newUser->id);

                        Log::channel('update')->info(
                            "User not found  the voice: ({$cVoice->id}) and new user ({$newUser->id})"
                        );
                    }
                    $cVoice->voiceover_id = $newUser->id;
                    $cVoice->save();

                    Log::channel('update')->info(
                        "voice: ({$cVoice->id}) updated user: ({$newUser->id})"
                    );
                }
            }
        });
    }

}
