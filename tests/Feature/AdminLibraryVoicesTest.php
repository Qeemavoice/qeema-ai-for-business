<?php

namespace Tests\Feature;

use App\Services\NewUi\Accounts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** Admin «الأصوات» lists the library voices of the old `voices` table; edit saves there, delete only hides */
class AdminLibraryVoicesTest extends TestCase
{
    use RefreshDatabase;

    public function test_library_voices_are_listed_edited_and_hidden()
    {
        foreach ([1 => 'admin', 2 => 'client'] as $id => $slug) DB::table('user_types')->insert(['id' => $id, 'name' => $slug, 'slug' => $slug]);
        foreach (range(1, 4) as $id) DB::table('user_statuses')->insert(['id' => $id, 'name' => 'status ' . $id]);
        foreach ([1 => 'draft', 2 => 'review', 3 => 'accepted', 4 => 'rejected'] as $id => $n) DB::table('voice_statuses')->insert(['id' => $id, 'name' => json_encode(['ar' => $n])]);
        foreach ([1 => 'child', 2 => 'man', 3 => 'women'] as $id => $n) DB::table('voice_types')->insert(['id' => $id, 'name' => json_encode(['ar' => $n])]);
        $admin = Accounts::createAccount('مشرف', 'admin@example.test', 'password-123', 'client');
        $admin->forceFill(['user_type_id' => 1])->save();
        $narrator = Accounts::createAccount('معلق', 'narrator@example.test', 'password-123', 'client');
        DB::table('voices')->insert(['id' => 501, 'title' => json_encode(['ar' => 'إعلان حماسي']), 'price_per_minute' => 40, 'total_price' => 52,
            'voiceover_id' => $narrator->id, 'voice_type_id' => 2, 'voice_status_id' => 3, 'created_at' => now(), 'updated_at' => now()]);
        $api = $this->withHeader('Authorization', 'Bearer ' . Accounts::issueToken($admin))->withHeader('Accept', 'application/json');

        $items = $api->getJson('/api/v1/admin/collections/humanVoices')->assertOk()->json('items');
        $this->assertSame('إعلان حماسي', collect($items)->firstWhere('id', '501')['sampleName']);

        $api->putJson('/api/v1/admin/collections/humanVoices/501', ['sampleName' => 'إعلان هادئ', 'narratorPriceUsd' => 5000])->assertStatus(400);
        $api->putJson('/api/v1/admin/collections/humanVoices/501', ['sampleName' => 'إعلان هادئ', 'narratorPriceUsd' => 45, 'gender' => 'female'])->assertOk()
            ->assertJsonPath('item.sampleName', 'إعلان هادئ')->assertJsonPath('item.narratorPriceUsd', 45)->assertJsonPath('item.gender', 'female');

        $api->deleteJson('/api/v1/admin/collections/humanVoices/501')->assertOk();
        $this->assertSame(1, (int) DB::table('voices')->where('id', 501)->value('voice_status_id'));   // hidden (draft), not erased
        $this->assertSame('hidden', collect($api->getJson('/api/v1/admin/collections/humanVoices')->json('items'))->firstWhere('id', '501')['status']);

        $api->postJson('/api/v1/admin/collections/humanVoices', ['sampleName' => 'جديد'])->assertStatus(400);
    }
}
