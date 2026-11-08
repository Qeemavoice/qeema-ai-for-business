<?php

namespace Tests\Feature;

use App\Services\NewUi\Accounts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** A narrator sets the prices once and signs the agreement once; neither can be changed afterwards (state saves included) */
class NarratorOnceTest extends TestCase
{
    use RefreshDatabase;

    public function test_prices_and_agreement_are_set_once()
    {
        foreach ([1 => 'admin', 2 => 'client', 3 => 'voice-actor', 4 => 'both'] as $id => $slug) DB::table('user_types')->insert(['id' => $id, 'name' => $slug, 'slug' => $slug]);
        foreach (range(1, 4) as $id) DB::table('user_statuses')->insert(['id' => $id, 'name' => 'status ' . $id]);
        $u = Accounts::createAccount('معلق', 'narrator@example.test', 'password-123', 'talent');
        $h = ['Authorization' => 'Bearer ' . Accounts::issueToken($u), 'Accept' => 'application/json'];
        $nid = 'narrator_u' . $u->id;

        $this->postJson('/api/v1/narrators/me/rates', ['perMinuteUsd' => 30, 'hourlyUsd' => 200])->assertStatus(403);
        $this->postJson('/api/v1/narrators/me/rates', ['perMinuteUsd' => 0, 'hourlyUsd' => 200], $h)->assertStatus(400);
        $this->postJson('/api/v1/narrators/me/rates', ['perMinuteUsd' => 30, 'hourlyUsd' => 200], $h)->assertOk()->assertJsonPath('narrator.rates.perMinuteUsd', 30);
        $this->postJson('/api/v1/narrators/me/rates', ['perMinuteUsd' => 99, 'hourlyUsd' => 999], $h)->assertStatus(409);

        $this->postJson('/api/v1/narrators/me/consent', ['accepted' => false], $h)->assertStatus(400);
        $at = $this->postJson('/api/v1/narrators/me/consent', ['accepted' => true], $h)->assertOk()->json('narrator.consent.acceptedAt');
        $this->assertNotEmpty($at);

        // a full state save from the browser cannot change them back
        $state = $this->getJson('/api/v1/narrators/state', $h)->assertOk()->json();
        foreach ($state['narrators'] as &$n) if ($n['id'] === $nid) { $n['rates']['perMinuteUsd'] = 1; $n['ratesSetAt'] = null; $n['consent'] = null; }
        $this->putJson('/api/v1/narrators/state', $state, $h)->assertOk();
        $mine = collect($this->getJson('/api/v1/narrators/state', $h)->json('narrators'))->firstWhere('id', $nid);
        $this->assertEquals(30, $mine['rates']['perMinuteUsd']);
        $this->assertSame($at, $mine['consent']['acceptedAt']);
    }
}
