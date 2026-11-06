<?php

use Illuminate\Support\Facades\Route;

Route::get('change-language/{locale}', 'ChangeLanguageController@changeLanguages')->name('change.language');
Route::get('/sitemap.xml', 'SitemapXmlController@index');


Route::group([
    'prefix' => 'uploads',
    //'middleware' => ['un.auth'],
    'namespace' => 'Upload',
    'as' => 'upload.'
], function () {
    Route::post('file', 'UploadFileController@uploadFile')->name('file');
    Route::post('uploadFileOnCrop/{dir}', 'UploadFileController@uploadFileOnCrop')->name('uploadFileOnCrop');
});

