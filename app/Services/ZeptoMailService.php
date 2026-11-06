<?php


namespace App\Services;

use Illuminate\Support\Facades\Http;

class ZeptoMailService
{
    protected $apiKey;
    protected $url;

    public function __construct()
    {
        $this->apiKey = config('services.zeptomail.api_key');
        $this->url = 'https://api.zeptomail.com/v1.1/email';
    }

    public function send($to, $subject, $html)
    {
        $response = Http::withHeaders([
            'accept' => 'application/json',
            'authorization' => 'Zoho-enczapikey ' . $this->apiKey,
            'content-type' => 'application/json',
        ])->post($this->url, [
            'bounce_address' => config('services.zeptomail.bounce_address'),
            'from' => [
                'address' => config('services.zeptomail.from_address'),
                'name' => config('services.zeptomail.from_name'),
            ],
            'to' => [
                ['email_address' => ['address' => $to]],
            ],
            'subject' => $subject,
            'htmlbody' => $html,
        ]);

        return $response->json();
    }
}
