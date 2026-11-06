<?php

namespace Tests\Unit;

use App\Services\QeemaTextAssistant;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class QeemaTextAssistantTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'cache.default' => 'array',
            'services.gemini.api_key' => 'test-key',
            'services.gemini.model' => 'test-model',
            'services.gemini.base_url' => 'https://gemini.test/v1beta',
            'services.gemini.guest_daily_limit' => 5,
            'services.gemini.user_daily_limit' => 20,
            'services.gemini.global_daily_limit' => 500,
        ]);

        Cache::flush();
    }

    public function test_pricing_is_answered_locally_without_using_gemini(): void
    {
        Http::fake();

        $reply = app(QeemaTextAssistant::class)->reply(
            'ما هي الأسعار؟',
            [],
            'ar',
            'guest:test',
            false
        );

        $this->assertSame('local', $reply['source']);
        $this->assertSame('pricing', $reply['cardType']);
        $this->assertSame(5, $reply['quota']['remaining']);
        Http::assertNothingSent();
    }

    public function test_guest_is_limited_to_five_gemini_messages_per_day(): void
    {
        Http::fake([
            'https://gemini.test/*' => Http::response([
                'candidates' => [[
                    'content' => [
                        'parts' => [['text' => 'إجابة تجريبية']],
                    ],
                ]],
            ]),
        ]);

        $assistant = app(QeemaTextAssistant::class);

        for ($index = 1; $index <= 5; $index++) {
            $reply = $assistant->reply(
                'ساعدني في اختيار نبرة للمشروع رقم ' . $index,
                [],
                'ar',
                'guest:test',
                false
            );

            $this->assertSame('gemini', $reply['source']);
        }

        $blocked = $assistant->reply(
            'لدي سؤال إضافي عن النبرة',
            [],
            'ar',
            'guest:test',
            false
        );

        $this->assertSame('fallback', $blocked['source']);
        $this->assertSame('quota_exhausted', $blocked['reason']);
        $this->assertSame(0, $blocked['quota']['remaining']);
        Http::assertSentCount(5);
    }
}
