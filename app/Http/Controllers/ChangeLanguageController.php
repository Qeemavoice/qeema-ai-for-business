<?php


namespace App\Http\Controllers;


class ChangeLanguageController extends Controller
{
    protected $previousRequest;
    protected $locale;

    public function changeLanguages($locale)
    {

        $this->previousRequest = $this->getPreviousRequest();
        $this->locale = $locale;

        // Store the segments of the last request as an array
        $segments = $this->previousRequest->segments();

        // Check if the first segment matches a language code
        if (array_key_exists($this->locale, config('app.locales'))) {
            // Replace the first segment by the new language code
            $segments[0] = $this->locale;

            // Redirect to the required URL

            return redirect()->to($this->buildNewRoute($segments));
        }
        return back()->cookie('locale',  $this->locale, 1300000);
    }

    protected function getPreviousRequest()
    {
        // We Transform the URL on which the user was into a Request instance
        return request()->create(url()->previous());
    }

    protected function buildNewRoute($newRoute)
    {
        $redirectUrl = implode('/', $newRoute);
        // Get Query Parameters if any, so they are preserved
        $queryBag = $this->previousRequest->query();
        $redirectUrl .= count($queryBag) ? '?' . http_build_query($queryBag) : '';
        return $redirectUrl;
    }
}
