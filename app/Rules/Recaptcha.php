<?php

namespace App\Rules;

use GuzzleHttp\Client;
use Illuminate\Contracts\Validation\Rule;

class Recaptcha implements Rule
{
    const URL = 'https://www.google.com/recaptcha/api/siteverify';

    public function passes($attribute, $value)
    {
        $client = new Client;
        $response = $client->post(
            'https://www.google.com/recaptcha/api/siteverify',
            [
                'form_params' =>
                    [
                        'secret' => config('services.recaptcha.secret'),
                        'response' => $value
                    ]
            ]
        );
        $body = json_decode((string)$response->getBody());
        return response()->json($body->success);
    }



    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return trans('messages.recaptcha');
    }

}
