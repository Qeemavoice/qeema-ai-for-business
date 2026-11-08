<?php

namespace Tests\Feature;

use App\Services\NewUi\Accounts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** «تعديل» a narrator from the admin dashboard: name (also the account's) and per-minute price; admins only */
class AdminNarratorEditTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_edits_a_narrators_name_and_price()
    {
        foreach ([1 => 'admin', 2 => 'client', 3 => 'voice-actor', 4 => 'both'] as $id => $slug) DB::table('user_types')->insert(['id' => $id, 'name' => $slug, 'slug' => $slug]);
        foreach (range(1, 4) as $id) DB::table('user_statuses')->insert(['id' => $id, 'name' => 'status ' . $id]);
        $admin = Accounts::createAccount('مشرف', 'admin@example.test', 'password-123', 'client');
        $admin->forceFill(['user_type_id' => 1])->save();
        $narrator = Accounts::createAccount('اسم قديم', 'narrator@example.test', 'password-123', 'talent');
        $id = 'narrator_u' . $narrator->id;
        $url = '/api/v1/admin/narrators/' . $id;
        $api = $this->withHeader('Authorization', 'Bearer ' . Accounts::issueToken($admin))->withHeader('Accept', 'application/json');
        $this->assertNotNull(collect($api->getJson('/api/v1/narrators/state')->json('narrators'))->firstWhere('id', $id));

        $this->postJson($url, ['displayName' => 'اسم جديد'], ['Authorization' => 'Bearer ' . Accounts::issueToken($narrator), 'Accept' => 'application/json'])->assertStatus(403);
        $api->postJson('/api/v1/admin/narrators/narrator_u999999', ['displayName' => 'اسم'])->assertStatus(404);
        $api->postJson($url, ['displayName' => 'ا'])->assertStatus(400);
        $api->postJson($url, ['perMinuteUsd' => 5000])->assertStatus(400);

        $api->postJson($url, ['displayName' => '  اسم   جديد ', 'perMinuteUsd' => 25])->assertOk()
            ->assertJsonPath('narrator.displayName', 'اسم جديد')->assertJsonPath('narrator.rates.perMinuteUsd', 25);
        $n = collect($api->getJson('/api/v1/narrators/state')->json('narrators'))->firstWhere('id', $id);
        $this->assertSame(['اسم جديد', 25], [$n['displayName'], $n['rates']['perMinuteUsd']]);
        $this->assertSame('اسم جديد', Accounts::name($narrator->fresh()));   // the account's own name follows
    }

    public function test_admin_adds_a_narrator_account()
    {
        foreach ([1 => 'admin', 2 => 'client', 3 => 'voice-actor', 4 => 'both'] as $id => $slug) DB::table('user_types')->insert(['id' => $id, 'name' => $slug, 'slug' => $slug]);
        foreach (range(1, 4) as $id) DB::table('user_statuses')->insert(['id' => $id, 'name' => 'status ' . $id]);
        $admin = Accounts::createAccount('مشرف', 'admin@example.test', 'password-123', 'client');
        $admin->forceFill(['user_type_id' => 1])->save();
        $client = Accounts::createAccount('عميل', 'client@example.test', 'password-123', 'client');
        $api = $this->withHeader('Authorization', 'Bearer ' . Accounts::issueToken($admin))->withHeader('Accept', 'application/json');
        $new = ['displayName' => 'معلق جديد', 'email' => 'New.Narrator@example.test', 'phone' => '+966 50 000 0000', 'perMinuteUsd' => 30, 'sendInvite' => true];

        $this->postJson('/api/v1/admin/narrators', $new, ['Authorization' => 'Bearer ' . Accounts::issueToken($client), 'Accept' => 'application/json'])->assertStatus(403);
        $api->postJson('/api/v1/admin/narrators', ['email' => 'bad'] + $new)->assertStatus(400);
        $api->postJson('/api/v1/admin/narrators', ['email' => 'client@example.test'] + $new)->assertStatus(409);
        $res = $api->postJson('/api/v1/admin/narrators', $new)->assertOk();
        $id = $res->json('narrator.id');
        $this->assertMatchesRegularExpression('/^narrator_u\d+$/', $id);
        $this->assertSame(['معلق جديد', 30, 'invited'], [$res->json('narrator.displayName'), $res->json('narrator.rates.perMinuteUsd'), $res->json('narrator.status')]);
        $this->assertStringContainsString('/claim/', $res->json('invite.link'));
        $u = \App\Models\User::where('email', 'new.narrator@example.test')->first();
        $this->assertSame([3, '+966500000000'], [(int) $u->user_type_id, $u->mobile]);
        $this->assertSame(1, collect($api->getJson('/api/v1/narrators/state')->json('narrators'))->where('id', $id)->count());   // listed once
        $api->postJson('/api/v1/admin/narrators', $new)->assertStatus(409);   // same e-mail twice
    }
}
