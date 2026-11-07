<?php

namespace Tests\Feature;

use App\Services\NewUi\Accounts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** Fixes from the full site check: login rate limit, reviews only after delivery, security headers */
class QaFixesTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_is_rate_limited()
    {
        foreach (range(1, 10) as $i) $this->postJson('/api/v1/auth/login', ['email' => 'x@example.test', 'password' => 'wrong'])->assertStatus(401);
        $this->postJson('/api/v1/auth/login', ['email' => 'x@example.test', 'password' => 'wrong'])->assertStatus(429);
    }

    public function test_review_needs_a_delivered_booking_and_returns_it()
    {
        foreach ([1 => 'admin', 2 => 'client', 3 => 'voice_actor'] as $id => $slug) DB::table('user_types')->insert(['id' => $id, 'name' => $slug, 'slug' => $slug]);
        foreach (range(1, 4) as $id) DB::table('user_statuses')->insert(['id' => $id, 'name' => 'status ' . $id]);
        foreach ([1 => 'draft', 2 => 'review', 3 => 'accepted', 4 => 'rejected'] as $id => $n) DB::table('voice_statuses')->insert(['id' => $id, 'name' => json_encode(['ar' => $n])]);
        foreach ([1 => 'child', 2 => 'man', 3 => 'women'] as $id => $n) DB::table('voice_types')->insert(['id' => $id, 'name' => json_encode(['ar' => $n])]);
        DB::statement('PRAGMA foreign_keys = OFF');
        $narrator = Accounts::createAccount('معلق', 'n@example.test', 'password-123', 'talent');
        DB::table('voices')->insert(['id' => 701, 'title' => json_encode(['ar' => 'إعلان']), 'price_per_minute' => 20, 'total_price' => 26, 'voiceover_id' => $narrator->id,
            'voice_type_id' => 2, 'voice_status_id' => 3, 'created_at' => now(), 'updated_at' => now()]);
        \App\Services\NewUi\Library::forget();
        $client = Accounts::createAccount('عميل', 'c@example.test', 'password-123', 'client');
        $api = $this->withHeader('Authorization', 'Bearer ' . Accounts::issueToken($client))->withHeader('Accept', 'application/json');
        $id = $api->postJson('/api/v1/client/bookings', ['scriptText' => 'نص', 'sampleId' => '701', 'customerName' => 'عميل',
            'customerEmail' => 'c@example.test', 'customerWhatsapp' => '+966500000000'])->assertOk()->json('booking.id');

        $api->postJson("/api/v1/client/bookings/{$id}/review", ['rating' => 5])->assertStatus(400);   // still pending
        \App\Services\NewUi\Bookings::setStatus($id, 'delivered');
        $api->postJson("/api/v1/client/bookings/{$id}/review", ['rating' => 5])->assertOk()->assertJsonPath('booking.id', $id);
    }

    public function test_security_headers()
    {
        $this->get('/api/v1/health')->assertHeader('X-Frame-Options', 'SAMEORIGIN')->assertHeader('X-Content-Type-Options', 'nosniff');
    }
}
