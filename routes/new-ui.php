<?php

use Illuminate\Support\Facades\Route;

Route::get('/{path?}', 'NewUiController')
    ->where('path', '.*')
    ->name('new-ui.preview');
