<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'un.auth.admin'], function () {

    Route::get('/syn', 'SynDatabaseController@synIndex');
    Route::get('/synContactUs', 'SynDatabaseController@synContactUs')->name('synContactUs');
    Route::get('/synMailingLists', 'SynDatabaseController@synMailingLists')->name('synMailingLists');
    Route::get('/synJobs', 'SynDatabaseController@synJobs')->name('synJobs');
    Route::get('/synCoupons', 'SynDatabaseController@synCoupons')->name('synCoupons');
    Route::get('/synCategories', 'SynDatabaseController@synCategories')->name('synCategories');
    Route::get('/synWorks', 'SynDatabaseController@synWorks')->name('synWorks');
    Route::get('/synServices', 'SynDatabaseController@synServices')->name('synServices');
    Route::get('/synBanners', 'SynDatabaseController@synBanners')->name('synBanners');
    Route::get('/synFaqs', 'SynDatabaseController@synFaqs')->name('synFaqs');
    Route::get('/synLanguages', 'SynDatabaseController@synLanguages')->name('synLanguages');
    Route::get('/synGuides', 'SynDatabaseController@synGuides')->name('synGuides');
    Route::get('/synDialects', 'SynDatabaseController@synDialects')->name('synDialects');
    Route::get('/synPartners', 'SynDatabaseController@synPartners')->name('synPartners');
    Route::get('/synArticles', 'SynDatabaseController@synArticles')->name('synArticles');
    Route::get('/synCustomers', 'SynDatabaseController@synCustomers')->name('synCustomers');
    Route::get('/synVoiceActors', 'SynDatabaseController@synVoiceActors')->name('synVoiceActors');
    Route::get('/synClients', 'SynDatabaseController@synClients')->name('synClients');
    Route::get('/generateWallet', 'SynDatabaseController@generateWallet')->name('generateWallet');
    Route::get('/synVoicesAndSamples', 'SynDatabaseController@synVoicesAndSamples')->name('synVoicesAndSamples');
    Route::get('/synFavorites', 'SynDatabaseController@synFavorites')->name('synFavorites');
    Route::get('/synOrders', 'SynDatabaseController@synOrders')->name('synOrders');
    Route::get('/synProfits', 'SynDatabaseController@synProfits')->name('synProfits');
    Route::get('/synSiteSetting', 'SynDatabaseController@synSiteSetting')->name('synSiteSetting');
    Route::get('/synPages', 'SynDatabaseController@synPages')->name('synPages');
    Route::get('/updateNameUsers', 'SynDatabaseController@updateNameUsers')->name('updateNameUsers');
    Route::get('/addMissingVoiceOversTheVoiceTable', 'SynDatabaseController@addMissingVoiceOversTheVoiceTable')->name('addMissingVoiceOversTheVoiceTable');

    Route::group(['namespace' => 'Dashboard', 'as' => 'dashboard.'], function () {
        Route::get('/', 'DashboardController@index')->name('index');
    });

    Route::group(['prefix' => 'notifications', 'namespace' => 'Notification', 'as' => 'notification.'], function () {
        Route::get('/', 'NotificationController@index')->name('index');
        Route::get('/data', 'NotificationController@data')->name('data');
    });

    Route::group(['prefix' => 'chat', 'namespace' => 'Chat', 'as' => 'chat.'], function () {
        Route::get('/', 'ChatController@index')->name('index');
        Route::get('fetch-messages', 'ChatController@fetchMessages')->name('fetchMessages');
        Route::post('store', 'ChatController@store')->name('store');
    });

    Route::group(['prefix' => 'my-profile', 'namespace' => 'MyProfile', 'as' => 'myProfile.'], function () {
        Route::get('/', 'MyProfileController@index')->name('index');
        Route::get('/edit', 'MyProfileController@edit')->name('edit');
        Route::post('/change-password', 'MyProfileController@changePassword')->name('changePassword');
    });

    Route::group(['prefix' => 'currencies', 'namespace' => 'Currency', 'as' => 'currency.'], function () {
        Route::get('/all', 'CurrencyController@all')->name('all');
    });

    Route::prefix('orders')->namespace('Order')->as('order.')->group(function () {
        Route::get('/', 'OrderController@index')->name('index');
        Route::get('/data', 'OrderController@data')->name('data');
        Route::post('/update', 'OrderController@update')->name('update');
        Route::get('{id}/details', 'OrderDetailsController@index')->name('details.index');
    });

    Route::prefix('orders-cancellation-requests')->as('orderCancellationRequest.')->namespace('OrderCancellationRequest')->group(function () {
        Route::get('/', 'OrderCancellationRequestController@index')->name('index');
        Route::get('/data', 'OrderCancellationRequestController@data')->name('data');
        Route::put('/{id}/accept', 'OrderCancellationRequestController@accept')->name('accept');
        Route::put('/{id}/reject', 'OrderCancellationRequestController@reject')->name('reject');
    });

    Route::prefix('transactions')->as('transaction.')->namespace('Transaction')->group(function () {
        Route::get('/', 'TransactionController@index')->name('index');
        Route::get('/data', 'TransactionController@data')->name('data');
    });

    Route::prefix('profits')->as('profit.')->namespace('Profit')->group(function () {
        Route::get('/', 'ProfitController@index')->name('index');
        Route::get('/data', 'ProfitController@data')->name('data');
        Route::get('/create', 'ProfitController@create')->name('create');
        Route::get('{id}/edit', 'ProfitController@edit')->name('edit');
        Route::post('/store', 'ProfitController@store')->name('store');
        Route::delete('{id}/delete', 'ProfitController@destroy')->name('destroy');
    });

//    Route::prefix('wallets')->as('wallet.')->namespace('Wallet')->group(function () {
//        Route::get('/', 'WalletController@index')->name('index');
//        Route::get('/data', 'WalletController@data')->name('data');
//        Route::post('/create', 'WalletController@profit')->name('create');
//    });

    Route::group(['prefix' => 'admins', 'namespace' => 'Admin', 'as' => 'admin.'], function () {
        Route::get('/', 'AdminController@index')->name('index');
        Route::get('/data', 'AdminController@data')->name('data');
        Route::get('/create', 'AdminController@create')->name('create');
        Route::get('{id}/edit', 'AdminController@edit')->name('edit');
        Route::post('/store', 'AdminController@store')->name('store');
        Route::delete('{id}/delete', 'AdminController@destroy')->name('destroy');
        Route::get('{id}/details', 'AdminDetailsController@index')->name('details.index');
    });

    Route::group(['prefix' => 'forms', 'namespace' => 'Form', 'as' => 'form.'], function () {
        Route::get('/', 'FormController@index')->name('index');
        Route::get('/data', 'FormController@data')->name('data');
        Route::get('/create', 'FormController@create')->name('create');
        Route::get('{id}/edit', 'FormController@edit')->name('edit');
        Route::post('/store', 'FormController@store')->name('store');
        Route::delete('{id}/delete', 'FormController@destroy')->name('destroy');

        Route::get('{id}/details', 'FormDetailsController@index')->name('details.index');
        Route::get('{id}/details/data', 'FormDetailsController@data')->name('details.data');

        Route::group(['prefix' => 'input-fields', 'as' => 'inputField.'], function () {
            Route::get('/all', 'InputFieldController@all')->name('all');
        });
    });

    Route::group(['prefix' => 'guides', 'namespace' => 'Guide', 'as' => 'guide.'], function () {
        Route::get('/', 'GuideController@index')->name('index');
        Route::get('/data', 'GuideController@data')->name('data');
        Route::get('/create', 'GuideController@create')->name('create');
        Route::get('{id}/edit', 'GuideController@edit')->name('edit');
        Route::post('/store', 'GuideController@store')->name('store');
        Route::delete('{id}/delete', 'GuideController@destroy')->name('destroy');


        Route::group(['prefix' => '{id}'], function () {

            Route::group(['prefix' => 'details', 'as' => 'details.'], function () {
                Route::get('/', 'GuideDetailsController@index')->name('index');
            });

            Route::group(['prefix' => 'comments', 'as' => 'comment.'], function () {
                Route::get('/data', 'GuideCommentController@data')->name('data');
                Route::put('/change-status', 'GuideCommentController@changeStatus')->name('changeStatus');
            });

            Route::group(['prefix' => 'downloads', 'as' => 'download.'], function () {
                Route::get('/data', 'GuideDownloadController@data')->name('data');
            });
        });
    });


    Route::group(['prefix' => 'clients', 'namespace' => 'Client', 'as' => 'client.'], function () {
        Route::get('/', 'ClientController@index')->name('index');
        Route::get('/data', 'ClientController@data')->name('data');
//        Route::get('/create', 'ClientController@create')->name('create');
//        Route::get('{id}/edit', 'ClientController@edit')->name('edit');
//        Route::delete('{id}/delete', 'ClientController@destroy')->name('destroy');
        Route::get('{id}/details', 'ClientController@index')->name('details.index');
    });

    Route::group(['prefix' => 'roles', 'namespace' => 'Role', 'as' => 'role.'], function () {
        Route::get('/', 'RoleController@index')->name('index');
        Route::get('/data', 'RoleController@data')->name('data');
        Route::get('/create', 'RoleController@create')->name('create');
        Route::post('/store', 'RoleController@store')->name('store');
        Route::get('{id}/edit', 'RoleController@edit')->name('edit');
        Route::delete('{id}/delete', 'RoleController@destroy')->name('destroy');
        Route::get('/all', 'RoleController@all')->name('all');

        Route::get('{id}/details', 'RoleDetailsController@index')->name('details.index');
        Route::get('{id}/admins-assigned', 'RoleDetailsController@adminsAssigned')->name('adminsAssigned');
        Route::delete('{roleId}/{id}/admin-assigned-delete', 'RoleDetailsController@adminsAssignedDestroy')->name('adminsAssignedDestroy');
    });

    Route::group(['prefix' => 'permissions', 'namespace' => 'Permission', 'as' => 'permission.'], function () {
        Route::get('/', 'PermissionController@index')->name('index');
        Route::get('/data', 'PermissionController@data')->name('data');
        Route::get('/create', 'PermissionController@create')->name('create');
        //Route::post('/store', 'PermissionController@store')->name('store');
        Route::get('{id}/edit', 'PermissionController@edit')->name('edit');
        // Route::delete('{id}/delete', 'PermissionController@destroy')->name('destroy');
        Route::get('/all', 'PermissionController@all')->name('all');
    });

    Route::group(['prefix' => 'mail-messages', 'namespace' => 'MailMessage', 'as' => 'mailMessage.'], function () {
        Route::get('/', 'MailMessageController@index')->name('index');
        Route::get('/data', 'MailMessageController@data')->name('data');
        Route::get('/create', 'MailMessageController@create')->name('create');
        Route::post('/store', 'MailMessageController@store')->name('store');
        Route::get('{id}/edit', 'MailMessageController@edit')->name('edit');
        Route::delete('{id}/delete', 'MailMessageController@destroy')->name('destroy');
        Route::delete('delete-all', 'MailMessageController@destroyAll')->name('destroyAll');
        Route::put('{id}/change-type', 'MailMessageController@changeType')->name('changeType');
        Route::put('change-type-all', 'MailMessageController@changeTypeAll')->name('changeTypeAll');
        Route::get('{id}/details', 'MailMessageDetailsController@index')->name('details.index');

    });

    Route::group(['prefix' => 'languages', 'namespace' => 'Language', 'as' => 'language.'], function () {
        Route::get('/', 'LanguageController@index')->name('index');
        Route::get('/data', 'LanguageController@data')->name('data');
        Route::get('/create', 'LanguageController@create')->name('create');
        Route::get('{id}/edit', 'LanguageController@edit')->name('edit');
        Route::post('/store', 'LanguageController@store')->name('store');
        Route::delete('{id}/delete', 'LanguageController@destroy')->name('destroy');
        Route::get('{id}/details', 'LanguageDetailsController@index')->name('details.index');
        Route::get('/all', 'LanguageController@all')->name('all');
    });


    Route::group(['prefix' => 'dialects', 'namespace' => 'Dialect', 'as' => 'dialect.'], function () {
        Route::get('/', 'DialectController@index')->name('index');
        Route::get('/data', 'DialectController@data')->name('data');
        Route::get('/create', 'DialectController@create')->name('create');
        Route::get('{id}/edit', 'DialectController@edit')->name('edit');
        Route::post('/store', 'DialectController@store')->name('store');
        Route::delete('{id}/delete', 'DialectController@destroy')->name('destroy');
        Route::get('{id}/details', 'DialectController@index')->name('details.index');
    });

    Route::group(['prefix' => 'categories', 'namespace' => 'Category', 'as' => 'category.'], function () {
        Route::get('/', 'CategoryController@index')->name('index');
        Route::get('/data', 'CategoryController@data')->name('data');
        Route::get('/create', 'CategoryController@create')->name('create');
        Route::get('{id}/edit', 'CategoryController@edit')->name('edit');
        Route::post('/store', 'CategoryController@store')->name('store');
        Route::delete('{id}/delete', 'CategoryController@destroy')->name('destroy');
        Route::get('{id}/details', 'CategoryController@index')->name('details.index');
    });

    Route::group(['prefix' => 'articles', 'namespace' => 'Article', 'as' => 'article.'], function () {
        Route::get('/', 'ArticleController@index')->name('index');
        Route::get('/data', 'ArticleController@data')->name('data');
        Route::get('/create', 'ArticleController@create')->name('create');
        Route::get('{id}/edit', 'ArticleController@edit')->name('edit');
        Route::post('/store', 'ArticleController@store')->name('store');
        Route::delete('{id}/delete', 'ArticleController@destroy')->name('destroy');
        Route::get('{id}/details', 'ArticleController@index')->name('details.index');
    });

    Route::group(['prefix' => 'careers', 'namespace' => 'Career', 'as' => 'career.'], function () {

        Route::get('/', 'CareerController@index')->name('index');
        Route::get('/data', 'CareerController@data')->name('data');
        Route::get('/create', 'CareerController@create')->name('create');
        Route::get('{id}/edit', 'CareerController@edit')->name('edit');
        Route::post('/store', 'CareerController@store')->name('store');
        Route::delete('{id}/delete', 'CareerController@destroy')->name('destroy');

        Route::get('{id}/details', 'CareerDetailsController@index')->name('details.index');
        Route::get('{id}/details/data', 'CareerDetailsController@data')->name('details.data');
    });

    Route::group(['prefix' => 'partners', 'namespace' => 'Partner', 'as' => 'partner.'], function () {
        Route::get('/', 'PartnerController@index')->name('index');
        Route::get('/data', 'PartnerController@data')->name('data');
        Route::get('/create', 'PartnerController@create')->name('create');
        Route::get('{id}/edit', 'PartnerController@edit')->name('edit');
        Route::post('/store', 'PartnerController@store')->name('store');
        Route::delete('{id}/delete', 'PartnerController@destroy')->name('destroy');
        Route::get('{id}/details', 'PartnerController@index')->name('details.index');
    });

    Route::group(['prefix' => 'booking-steps', 'namespace' => 'BookingStep', 'as' => 'bookingStep.'], function () {
        Route::get('/', 'BookingStepController@index')->name('index');
        Route::get('/data', 'BookingStepController@data')->name('data');
        Route::get('/create', 'BookingStepController@create')->name('create');
        Route::get('{id}/edit', 'BookingStepController@edit')->name('edit');
        Route::post('/store', 'BookingStepController@store')->name('store');
        Route::delete('{id}/delete', 'BookingStepController@destroy')->name('destroy');
    });

    Route::group(['prefix' => 'works', 'namespace' => 'Work', 'as' => 'work.'], function () {
        Route::get('/', 'WorkController@index')->name('index');
        Route::get('/data', 'WorkController@data')->name('data');
        Route::get('/create', 'WorkController@create')->name('create');
        Route::get('{id}/edit', 'WorkController@edit')->name('edit');
        Route::post('/store', 'WorkController@store')->name('store');
        Route::delete('{id}/delete', 'WorkController@destroy')->name('destroy');
        Route::get('{id}/details', 'WorkController@index')->name('details.index');
    });

    Route::group(['prefix' => 'services', 'namespace' => 'Service', 'as' => 'service.'], function () {
        Route::get('/', 'ServiceController@index')->name('index');
        Route::get('/data', 'ServiceController@data')->name('data');
        Route::get('/create', 'ServiceController@create')->name('create');
        Route::get('{id}/edit', 'ServiceController@edit')->name('edit');
        Route::post('/store', 'ServiceController@store')->name('store');
        Route::delete('{id}/delete', 'ServiceController@destroy')->name('destroy');
        Route::get('{id}/details', 'ServiceController@index')->name('details.index');
    });

    Route::group(['prefix' => 'banners', 'namespace' => 'Banner', 'as' => 'banner.'], function () {
        Route::get('/', 'BannerController@index')->name('index');
        Route::get('/data', 'BannerController@data')->name('data');
        Route::get('/create', 'BannerController@create')->name('create');
        Route::get('{id}/edit', 'BannerController@edit')->name('edit');
        Route::post('/store', 'BannerController@store')->name('store');
        Route::delete('{id}/delete', 'BannerController@destroy')->name('destroy');
        Route::get('{id}/details', 'BannerController@index')->name('details.index');
    });


    Route::group(['prefix' => 'customers', 'namespace' => 'Customer', 'as' => 'customer.'], function () {
        Route::get('/', 'CustomerController@index')->name('index');
        Route::get('/data', 'CustomerController@data')->name('data');
        Route::get('/create', 'CustomerController@create')->name('create');
        Route::get('{id}/edit', 'CustomerController@edit')->name('edit');
        Route::post('/store', 'CustomerController@store')->name('store');
        Route::delete('{id}/delete', 'CustomerController@destroy')->name('destroy');
        Route::get('{id}/details', 'CustomerController@index')->name('details.index');
    });

    Route::group(['prefix' => 'faqs', 'namespace' => 'Faq', 'as' => 'faq.'], function () {
        Route::get('/', 'FaqController@index')->name('index');
        Route::get('/data', 'FaqController@data')->name('data');
        Route::get('/create', 'FaqController@create')->name('create');
        Route::get('{id}/edit', 'FaqController@edit')->name('edit');
        Route::post('/store', 'FaqController@store')->name('store');
        Route::delete('{id}/delete', 'FaqController@destroy')->name('destroy');
        Route::get('{id}/details', 'FaqDetailsController@index')->name('details.index');
        Route::get('/search', 'FaqController@search')->name('search');
    });

    Route::group(['prefix' => 'settings', 'namespace' => 'Setting'], function () {
        Route::group(['as' => 'setting.', 'middleware' => []], function () {

            Route::get('{page?}', 'SettingController@index')->name('index');
            Route::post('/store', 'SettingController@store')->name('store');
        });


        Route::group(['prefix' => 'maintenance-mode', 'as' => 'maintenanceMode.'], function () {
            Route::post('/store', 'MaintenanceModeController@store')->name('store');
        });

        Route::group(['prefix' => 'payment-methods', 'as' => 'paymentMethod.'], function () {
            Route::get('/', 'PaymentMethodController@index')->name('index');
            Route::get('create', 'PaymentMethodController@create')->name('create');
            Route::get('/data', 'PaymentMethodController@data')->name('data');
            Route::post('/store', 'PaymentMethodController@store')->name('store');
            Route::get('{id}/edit', 'PaymentMethodController@edit')->name('edit');
            Route::delete('{id}/delete', 'PaymentMethodController@destroy')->name('destroy');
        });
    });


    Route::group(['prefix' => 'appearance', 'namespace' => 'Appearance'], function () {
        Route::group(['as' => 'appearance.', 'middleware' => [
        ]], function () {
            Route::get('{page?}', 'AppearanceController@index')->name('index');
        });
    });

    Route::prefix('voice-actors')->as('voiceActor.')->namespace('VoiceActor')->group(function () {
        Route::get('/', 'VoiceActorController@index')->name('index');
        Route::get('/create', 'VoiceActorController@create')->name('create');
        Route::get('{id}/edit', 'VoiceActorController@edit')->name('edit');
        Route::get('/data', 'VoiceActorController@data')->name('data');
        Route::post('/store', 'VoiceActorController@store')->name('store');
        Route::delete('{id}/delete', 'VoiceActorController@destroy')->name('destroy');
        Route::get('/search', 'VoiceActorController@search')->name('search');

        Route::get('{id}/details', 'VoiceActorDetailsController@index')->name('details.index');
    });

    Route::prefix('voice-actor-samples')->as('voiceActorSample.')->namespace('VoiceActorSample')->group(function () {
        Route::get('/', 'VoiceActorSampleController@index')->name('index');
        Route::get('/data', 'VoiceActorSampleController@data')->name('data');
    });

    Route::prefix('voices')->as('voice.')->namespace('Voice')->group(function () {
        Route::get('/', 'VoiceController@index')->name('index');
        Route::get('/create', 'VoiceController@create')->name('create');
        Route::get('{id}/edit', 'VoiceController@edit')->name('edit');
        Route::get('/data', 'VoiceController@data')->name('data');
        Route::post('/store', 'VoiceController@store')->name('store');
        Route::delete('{id}/delete', 'VoiceController@destroy')->name('destroy');
        Route::get('/search', 'VoiceController@search')->name('search');
    });

    Route::prefix('coupons')->as('coupon.')->namespace('Coupon')->group(function () {
        Route::get('/', 'CouponController@index')->name('index');
        Route::get('/create', 'CouponController@create')->name('create');
        Route::get('{id}/edit', 'CouponController@edit')->name('edit');
        Route::get('/data', 'CouponController@data')->name('data');
        Route::post('/store', 'CouponController@store')->name('store');
        Route::delete('{id}/delete', 'CouponController@destroy')->name('destroy');
    });

    Route::prefix('rating-criterias')->as('ratingCriteria.')->namespace('RatingCriteria')->group(function () {
        Route::get('/', 'RatingCriteriaController@index')->name('index');
        Route::get('/create', 'RatingCriteriaController@create')->name('create');
        Route::get('{id}/edit', 'RatingCriteriaController@edit')->name('edit');
        Route::get('/data', 'RatingCriteriaController@data')->name('data');
        Route::post('/store', 'RatingCriteriaController@store')->name('store');
        Route::delete('{id}/delete', 'RatingCriteriaController@destroy')->name('destroy');
    });

    Route::prefix('rating-groups')->as('ratingGroup.')->namespace('RatingGroup')->group(function () {
        Route::get('/', 'RatingGroupController@index')->name('index');
        Route::get('/create', 'RatingGroupController@create')->name('create');
        Route::get('{id}/edit', 'RatingGroupController@edit')->name('edit');
        Route::get('/data', 'RatingGroupController@data')->name('data');
        Route::post('/store', 'RatingGroupController@store')->name('store');
        Route::delete('{id}/delete', 'RatingGroupController@destroy')->name('destroy');
        Route::get('/search', 'RatingGroupController@search')->name('search');
    });


    Route::group(['prefix' => 'pages', 'namespace' => 'Page', 'as' => 'page.'], function () {
        Route::get('/{page?}', 'PageController@index')->name('index');
        Route::get('/all/all', 'PageController@all')->name('all');
        Route::post('/store', 'PageController@store')->name('store');
    });

    Route::group(['prefix' => 'mailing-lists', 'namespace' => 'MailingList', 'as' => 'mailingList.'], function () {
        Route::get('/', 'MailingListController@index')->name('index');
        Route::get('/data', 'MailingListController@data')->name('data');
        Route::delete('{id}/delete', 'MailingListController@destroy')->name('destroy');
    });

//    Route::group(['prefix' => 'contacts', 'as' => 'contacts.'], function () {
//        Route::get('/', 'ContactsController@index')->name('index');
//        Route::get('/data', 'ContactsController@data')->name('data');
//        Route::delete('{id}/delete', 'ContactsController@destroy')->name('destroy');
//    });


});

