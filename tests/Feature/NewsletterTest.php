<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Newsletter: the first subscription of an address gets one welcome e-mail; repeats do not */
class NewsletterTest extends TestCase
{
    use RefreshDatabase;

    public function test_first_subscription_gets_a_welcome_email()
    {
        config(['mail.default' => 'array', 'mail.from.address' => 'info@example.test']);
        $this->postJson('/api/v1/newsletter', ['email' => 'not-an-email'])->assertStatus(400);
        $this->postJson('/api/v1/newsletter', ['email' => 'Reader@Example.test'])->assertOk();
        $this->postJson('/api/v1/newsletter', ['email' => 'reader@example.test'])->assertOk();
        $sent = app('mailer')->getSwiftMailer()->getTransport()->messages();
        $this->assertCount(1, $sent);
        $this->assertArrayHasKey('reader@example.test', $sent->first()->getTo());
    }
}
