<?php

namespace Tests\Feature;

use App\Services\NewUi\Store;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** Provider keys are encrypted in the database and read back in clear by the app */
class EncryptedKeysTest extends TestCase
{
    use RefreshDatabase;

    public function test_keys_are_encrypted_at_rest()
    {
        $i = Store::integrations();
        $i['stripe']['testSecretKey'] = 'sk_test_abc123';
        $i['munsit']['apiKey'] = 'munsit-secret-xyz';
        Store::saveIntegrations($i);

        $raw = DB::table('qv_kv')->where('key', 'integrations')->value('value');
        $this->assertStringNotContainsString('sk_test_abc123', $raw);
        $this->assertStringNotContainsString('munsit-secret-xyz', $raw);
        $this->assertSame('sk_test_abc123', Store::integrations()['stripe']['testSecretKey']);
        $this->assertSame('munsit-secret-xyz', Store::integrationKey('munsit'));

        Store::saveIntegrations(Store::integrations());   // saving again does not double-encrypt
        $this->assertSame('munsit-secret-xyz', Store::integrationKey('munsit'));

        // an older plain value still reads, and is encrypted on the next save
        DB::table('qv_kv')->where('key', 'integrations')->update(['value' => json_encode(['elevenlabs' => ['apiKey' => 'plain-old']])]);
        $this->assertSame('plain-old', Store::integrationKey('elevenlabs'));
        Store::saveIntegrations(Store::integrations());
        $this->assertStringNotContainsString('plain-old', DB::table('qv_kv')->where('key', 'integrations')->value('value'));
    }
}
