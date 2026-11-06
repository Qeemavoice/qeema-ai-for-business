<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cookie;

class Language
{
    /**
     * Handle an incoming request.
     *
     * @param \Illuminate\Http\Request $request
     * @param \Closure $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $segment1 = $request->segment(1);

        $localeURL = $segment1 ? $segment1 : config('app.locale');


        // Check if the first segment matches a language code
        if (!array_key_exists($segment1, languages())) {

//            if(Cookie::get('locale')) {
//                $localeURL = Cookie::get('locale');
//            }

            // Store segments in array
            $segments = $request->segments();

            $segments = Arr::prepend($segments,  config('app.locale'));

            // Redirect to the correct url
            return redirect()->to(implode('/', $segments));
        }

        app()->setLocale($localeURL);

        // The request already contains the language code
        return $next($request);
    }
}
