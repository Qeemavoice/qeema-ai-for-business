<?php

namespace Tests\Feature;

use App\Services\NewUi\Accounts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** Strict site rule: a client never sees the narrator's name, anywhere (library, bookings, sitemap) — only the clip name */
class NarratorNameHiddenTest extends TestCase
{
    use RefreshDatabase;

    public function test_clients_never_receive_the_narrator_name()
    {
        foreach ([1 => 'admin', 2 => 'client', 3 => 'voice_actor'] as $id => $slug) DB::table('user_types')->insert(['id' => $id, 'name' => $slug, 'slug' => $slug]);
        foreach (range(1, 4) as $id) DB::table('user_statuses')->insert(['id' => $id, 'name' => 'status ' . $id]);
        foreach ([1 => 'draft', 2 => 'review', 3 => 'accepted', 4 => 'rejected'] as $id => $n) DB::table('voice_statuses')->insert(['id' => $id, 'name' => json_encode(['ar' => $n])]);
        foreach ([1 => 'child', 2 => 'man', 3 => 'women'] as $id => $n) DB::table('voice_types')->insert(['id' => $id, 'name' => json_encode(['ar' => $n])]);
        DB::statement('PRAGMA foreign_keys = OFF');   // orders reference lookup tables (currencies, payment methods…) this test does not seed
        $secret = 'محمد ابوبكر';
        $narrator = Accounts::createAccount($secret, 'narrator@example.test', 'password-123', 'talent');
        $row = ['price_per_minute' => 20, 'total_price' => 26, 'voiceover_id' => $narrator->id, 'voice_type_id' => 2, 'voice_status_id' => 3, 'created_at' => now(), 'updated_at' => now()];
        DB::table('voices')->insert(array_merge($row, ['id' => 601, 'title' => json_encode(['ar' => 'إعلان حماسي'])]));
        DB::table('voices')->insert(array_merge($row, ['id' => 602, 'title' => json_encode(['ar' => $secret])]));   // clip titled with the narrator's name

        \App\Services\NewUi\Library::forget();   // the library is cached across tests
        $public = $this->getJson('/api/v1/human-voices')->assertOk();
        $this->assertStringNotContainsString($secret, $public->getContent());
        $this->assertSame('إعلان حماسي', collect($public->json('items'))->firstWhere('id', '601')['name']);

        $client = Accounts::createAccount('عميل', 'client@example.test', 'password-123', 'client');
        $api = $this->withHeader('Authorization', 'Bearer ' . Accounts::issueToken($client))->withHeader('Accept', 'application/json');
        foreach (['601', '602'] as $sid) {
            $res = $api->postJson('/api/v1/client/bookings', ['scriptText' => 'نص الإعلان', 'sampleId' => $sid,
                'customerName' => 'عميل', 'customerEmail' => 'client@example.test', 'customerWhatsapp' => '+966500000000'])->assertOk();
            $this->assertStringNotContainsString($secret, $res->getContent());
        }
        $list = $api->getJson('/api/v1/client/bookings')->assertOk();
        $this->assertStringNotContainsString($secret, $list->getContent());
        $this->assertContains('إعلان حماسي', collect($list->json('bookings'))->pluck('sampleName')->all());

        $this->assertStringNotContainsString(rawurlencode('محمد'), $this->get('/sitemap.xml')->getContent());
    }
}
