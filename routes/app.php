<?php

use App\Mail\UserWelcomeMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

Route::get('/', 'HomeController@index')->name('home.index');
Route::post('/download-file', 'HomeController@downloadFile')->name('home.downloadFile');
Route::get('/categories/{slug?}', 'CategoryController@index')->name('category.index');

Route::group(['prefix' => 'voices', 'namespace' => 'Voice', 'as' => 'voice.'], function () {
    Route::get('/{slug?}', 'VoiceController@index')->name('index');
    Route::get('/do/load-more', 'VoiceController@loadMore')->name('loadMore');
    // Route::get('/do/data', 'VoiceController@data')->name('data');
});

Route::get('/booking-steps/{slug?}', 'BookingStepController@index')->name('bookingStep.index');
Route::get('/our-works/{slug}', 'OurWorkController@index')->name('ourWork.index');


Route::group(['prefix' => 'contact-us', 'as' => 'contactUs.'], function () {
    Route::get('/{slug?}', 'ContactUsController@index')->name('index');
    Route::post('/store', 'ContactUsController@store')->name('store');
});

Route::get('/p/{page}', 'PageController')->name('page.index');

Route::post('/forms/store', 'FormController')->name('form.store');

Route::post('newsletter/subscribe', 'SubscribeNewsLetterController')->name('newsLetter.subscribe');

Route::group(['prefix' => 'guides', 'namespace' => 'Guide', 'as' => 'guide.'], function () {
    Route::get('/', 'GuideController@index')->name('index');


    Route::get('/{slug}', 'GuideDetailsController@index')->name('details.index');

    Route::group(['prefix' => 'details', 'as' => 'details.'], function () {
        Route::post('/download', 'GuideDetailsController@download')->name('download');
        Route::post('/purchase', 'GuideDetailsPurchaseController@purchase')->name('purchase');

        Route::group(['prefix' => 'comments', 'as' => 'comment.'], function () {
            Route::post('/store', 'GuideDetailsCommentController@store')->name('store');
            Route::get('/data', 'GuideDetailsCommentController@data')->name('data');
        });

        Route::group(['prefix' => 'likes', 'as' => 'like.'], function () {
            Route::post('/store', 'GuideDetailsController@storeLike')->name('storeLike');
        });
    });

});

Route::group(['prefix' => 'faqs', 'namespace' => 'Faq', 'as' => 'faq.'], function () {
    Route::get('/{slug?}', 'FaqController@index')->name('index');
});

Route::group(['prefix' => 'blogs', 'namespace' => 'Blog', 'as' => 'blog.'], function () {
    Route::get('/{slug?}', 'BlogController@index')->name('index');
    Route::get('/details/{slug}', 'BlogController@details')->name('details');
});

Route::group(['namespace' => 'Career', 'as' => 'career.'], function () {

    Route::get('/careers', function () {
        return redirect()->to(route_app('career.index'), 301);
    });

    Route::group(['prefix' => 'jobs'], function () {
        Route::get('/', 'CareerController@index')->name('index');
        Route::get('/details/{slug}', 'CareerController@details')->name('details');
        Route::post('job-applications/apply', 'CareerController@apply')->name('apply');
    });
});


Route::group(['namespace' => 'Dashboard'], function () {
    Route::group(['prefix' => 'booking', 'namespace' => 'Client\Booking', 'as' => 'booking.'], function () {
        Route::get('/{slug}', 'BookingController@index')->name('index');
    });
    Route::group(['prefix' => 'clients', 'namespace' => 'Client', 'as' => 'client.'], function () {

        Route::group(['middleware' => ['un.auth.client']], function () {

            Route::put('/orders/{orderId}/complete', 'OrderController@complete')->name('order.complete');
            Route::put('/orders/{orderId}/cancellation-request', 'OrderController@cancellationRequest')->name('order.cancellationRequest');


            Route::group(['prefix' => 'profile', 'as' => 'profile.'], function () {
                Route::get('/', 'ProfileController@index')->name('index');
                Route::post('/update', 'ProfileController@update')->name('update');
            });

            Route::group(['prefix' => 'favorites', 'as' => 'favorite.'], function () {
                Route::get('/data', 'FavoriteController@data')->name('data');
                Route::post('/store', 'FavoriteController@store')->name('.store');
            });

            Route::post('/work-fields/update', 'WorkFieldController@update')->name('workField.update');
            Route::get('/cart', 'CartController@index')->name('cart.index');


            Route::group(['prefix' => 'voices', 'as' => 'voice.'], function () {
                Route::put('/update-listened', 'VoiceController@updateNumberListened')->name('updateNumberListened');
                Route::put('/update-likes', 'VoiceController@updateNumberLikes')->name('updateNumberLikes');
            });

            Route::group(['prefix' => 'invoices', 'as' => 'invoice.'], function () {
                Route::get('/data', 'InvoiceController@data')->name('data');
            });
        });

        Route::group(['prefix' => 'booking', 'namespace' => 'Booking', 'as' => 'booking.'], function () {
            Route::post('/', 'BookingController@booking')->name('store');
            Route::post('/validate-booking-order-request', 'BookingController@validateBookingOrderRequest')->name('validateBookingOrderRequest');
            Route::post('/apply-coupon', 'BookingController@applyCoupon')->name('applyCoupon');
        });
    });

    Route::group(['prefix' => 'voice-actors', 'middleware' => ['un.auth.voice_actor'], 'namespace' => 'VoiceActor', 'as' => 'voiceActor.'], function () {
        Route::group(['prefix' => 'profile', 'as' => 'profile.'], function () {
            Route::get('/', 'ProfileController@index')->name('index');
            Route::post('/update', 'ProfileController@update')->name('update');
        });

        Route::group(['prefix' => 'samples', 'as' => 'sample.'], function () {
            Route::post('/store', 'SampleController@store')->name('store');
            Route::get('/data', 'SampleController@data')->name('data');
            Route::get('{id}/edit', 'SampleController@edit')->name('edit');
            Route::delete('{id}/delete', 'SampleController@destroy')->name('destroy');
        });

        Route::group(['prefix' => 'payments', 'as' => 'payment.'], function () {
            Route::get('/data', 'PaymentController@data')->name('data');
        });


        Route::group(['prefix' => 'dialects', 'as' => 'dialect.'], function () {
            Route::get('/get-by-languageId', 'DialectController@getDialectsByLangId');
        });
    });


    Route::group(['middleware' => ['un.auth']], function () {

        Route::group(['prefix' => 'orders', 'as' => 'order.'], function () {
            Route::get('/data', 'OrderController@data')->name('data');
            Route::get('/details/{id}', 'OrderController@details')->name('details');
        });

        Route::group(['prefix' => 'rating', 'as' => 'rating.'], function () {
            Route::get('/get-criterias', 'RatingCriteriasController@getCriterias');

            Route::post('/send', 'FeedbackController@send')->name('feedback.send');
            Route::get('/details', 'FeedbackController@details')->name('feedback.details');

        });


        Route::group(['prefix' => 'notifications', 'as' => 'notification.'], function () {
            Route::get('/data', 'NotificationController@data')->name('data');
            Route::get('/get-the-number-of-unread-messages', 'NotificationController@getTheNumberOfUnreadMessages')->name('getTheNumberOfUnreadMessages');
        });

        Route::group(['prefix' => 'chat', 'namespace' => 'Chat', 'as' => 'chat.'], function () {
            Route::get('/', 'ChatController@index')->name('index');
            Route::get('fetch-messages', 'ChatController@fetchMessages')->name('fetchMessages');
            Route::post('store', 'ChatController@store')->name('store');
        });
    });
});


