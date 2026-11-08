<?php

namespace Tests\Feature;

use App\Services\NewUi\Accounts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** A picture chosen in the dashboard (e.g. a production model's image) is saved as a file, not inside the record */
class CollectionFilesTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_image_becomes_a_file()
    {
        foreach ([1 => 'admin', 2 => 'client'] as $id => $slug) DB::table('user_types')->insert(['id' => $id, 'name' => $slug, 'slug' => $slug]);
        foreach (range(1, 4) as $id) DB::table('user_statuses')->insert(['id' => $id, 'name' => 'status ' . $id]);
        $admin = Accounts::createAccount('مشرف', 'admin@example.test', 'password-123', 'client');
        $admin->forceFill(['user_type_id' => 1])->save();
        $api = $this->withHeader('Authorization', 'Bearer ' . Accounts::issueToken($admin))->withHeader('Accept', 'application/json');

        $png = 'data:image/png;base64,' . base64_encode(file_get_contents(__DIR__ . '/../../public/favicon.ico') ?: 'x');
        $item = $api->postJson('/api/v1/admin/collections/voiceTemplates', ['title' => 'نموذج', 'img' => $png, 'status' => 'published'])->assertSuccessful()->json();
        $item = $item['item'] ?? $item;
        $this->assertStringStartsWith('/uploads/qv/qv_', $item['img']);
        $this->assertFileExists(public_path(ltrim($item['img'], '/')));
        $updated = $api->putJson('/api/v1/admin/collections/voiceTemplates/' . $item['id'], ['img' => '/voice-models/ads-2.webp'])->assertOk()->json();
        $this->assertSame('/voice-models/ads-2.webp', ($updated['item'] ?? $updated)['img']);
        @unlink(public_path(ltrim($item['img'], '/')));
    }
}
