<?php

namespace App\Http\Controllers;

use Symfony\Component\HttpFoundation\BinaryFileResponse;

class NewUiController extends Controller
{
    public function __invoke(): BinaryFileResponse
    {
        $entrypoint = public_path('new-ui/index.html');

        abort_unless(is_file($entrypoint), 503, 'The new UI has not been built yet.');

        $headers = [
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ];

        if (! app()->environment('production')) {
            $headers['X-Robots-Tag'] = 'noindex, nofollow';
        }

        return response()->file($entrypoint, $headers);
    }
}
