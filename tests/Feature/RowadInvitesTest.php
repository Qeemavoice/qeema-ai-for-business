<?php

namespace Tests\Feature;

use App\Jobs\ExpireTtsCredits;
use App\Models\Invite;
use App\Models\User;
use App\Services\NewUi\Accounts;
use App\Services\RowadService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** «روّاد قيمة» acceptance tests (the 11 cases of the spec). Dates: config/rowad.php, Africa/Cairo. */
class RowadInvitesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // lookup rows the users table points to (the old site's seeders are commented out)
        foreach ([1 => 'admin', 2 => 'client', 3 => 'voice_actor', 4 => 'client_and_voice_actor'] as $id => $slug) {
            DB::table('user_types')->insert(['id' => $id, 'name' => $slug, 'slug' => $slug]);
        }
        foreach (range(1, 4) as $id) DB::table('user_statuses')->insert(['id' => $id, 'name' => 'status ' . $id]);
        $this->travelTo($this->cairo('2026-11-20 12:00:00'));   // inside the early window, before the public launch
    }

    private function cairo(string $at): Carbon
    {
        return Carbon::parse($at, 'Africa/Cairo');
    }

    /** A client account without the general sign-up bonus, so every balance below is the Rowad grant alone */
    private function client(string $email): User
    {
        $u = Accounts::createAccount('عميل تجريبي', $email, 'password-123', 'client');
        DB::table('qv_credit_transactions')->where('user_id', $u->id)->delete();
        return $u->fresh();
    }

    private function invite(array $attrs = []): Invite
    {
        return Invite::create(array_merge(['code' => RowadService::code(), 'status' => Invite::SENT,
            'expires_at' => RowadService::at('invite_expires_at')], $attrs));
    }

    private function api(User $u)
    {
        return $this->withHeader('Authorization', 'Bearer ' . Accounts::issueToken($u))->withHeader('Accept', 'application/json');
    }

    private function earlyGrants(User $u): int
    {
        return DB::table('qv_credit_transactions')->where('user_id', $u->id)->where('source', 'early_access')->where('type', 'grant')->count();
    }

    /** 1. valid code + signed-in user: access, 5,000 characters and the badge */
    public function test_valid_code_with_signed_in_user()
    {
        $u = $this->client('one@example.test');
        $inv = $this->invite(['email' => 'one@example.test']);

        $this->get('/ar/early?code=' . $inv->code . '&utm_source=email')
            ->assertRedirect('/ar/early?utm_source=email')->assertSessionHas('rowad_code', $inv->code);
        $this->actingAs($u, 'web')->withSession(['rowad_code' => $inv->code])->get('/ar/early')->assertRedirect('/ar/early/welcome');

        $u->refresh();
        $this->assertTrue($u->early_access);
        $this->assertNotNull($u->rowad_badge_at);
        $this->assertSame(5000, Accounts::balance($u->id));
        $this->assertSame(Invite::REDEEMED, $inv->fresh()->status);
        $this->api($u)->getJson('/api/v1/early/status')->assertOk()
            ->assertJsonPath('features.earlyAccess', true)->assertJsonPath('freeGrant.remaining', 5000);
    }

    /** 2. valid code + guest who then creates an account: activated right after the sign-up */
    public function test_guest_then_signup_is_activated_automatically()
    {
        $inv = $this->invite();
        $this->get('/ar/early?code=' . $inv->code)->assertRedirect();
        $this->withSession(['rowad_code' => $inv->code])->get('/ar/early')->assertOk()->assertSee('"state":"login"', false)
            ->assertSee('noindex, nofollow', false);
        $this->assertSame(Invite::OPENED, $inv->fresh()->status);

        // the browser sends the HttpOnly cookie set by /ar/early with the sign-up call (withCredentials: JSON test calls skip cookies otherwise)
        $res = $this->withCredentials()->withUnencryptedCookie(RowadService::COOKIE, $inv->code)
            ->postJson('/api/v1/auth/signup', ['name' => 'عميل جديد', 'email' => 'new@example.test', 'password' => 'password-123']);
        $res->assertOk()->assertJsonPath('rowadInvite', 'redeemed')->assertJsonPath('features.earlyAccess', true);
        $u = User::where('email', 'new@example.test')->first();
        $this->assertTrue($u->early_access);
        $this->assertSame(1, $this->earlyGrants($u));
    }

    /** 3. the same link twice with the same account: still 5,000 (no second grant) */
    public function test_same_account_twice_grants_once()
    {
        $u = $this->client('twice@example.test');
        $inv = $this->invite();
        $this->api($u)->postJson('/api/v1/early/redeem', ['code' => $inv->code])->assertOk()->assertJsonPath('status', 'redeemed');
        $this->api($u)->postJson('/api/v1/early/redeem', ['code' => $inv->code])->assertOk()->assertJsonPath('status', 'already');
        $this->actingAs($u, 'web')->withSession(['rowad_code' => $inv->code])->get('/ar/early')->assertRedirect('/ar/early/welcome');
        $this->assertSame(5000, Accounts::balance($u->id));
        $this->assertSame(1, $this->earlyGrants($u));
    }

    /** 4. a used code opened with another account: «الدعوة مستخدمة», nothing granted */
    public function test_code_used_by_another_account()
    {
        $first = $this->client('first@example.test');
        $other = $this->client('other@example.test');
        $inv = $this->invite();
        $this->api($first)->postJson('/api/v1/early/redeem', ['code' => $inv->code])->assertOk();

        $this->api($other)->postJson('/api/v1/early/redeem', ['code' => $inv->code])->assertStatus(409)->assertJsonPath('status', 'used');
        $this->actingAs($other, 'web')->withSession(['rowad_code' => $inv->code])->get('/ar/early')->assertOk()->assertSee('"state":"used"', false);
        $this->assertSame(0, Accounts::balance($other->id));
        $this->assertFalse((bool) $other->fresh()->early_access);
    }

    /** 5. an expired code: the expiry page and the invite becomes «expired» */
    public function test_expired_code()
    {
        $inv = $this->invite(['expires_at' => $this->cairo('2026-11-19 00:00:00')]);
        $this->withSession(['rowad_code' => $inv->code])->get('/ar/early')->assertOk()->assertSee('"state":"expired"', false);
        $this->assertSame(Invite::EXPIRED, $inv->fresh()->status);

        $u = $this->client('late@example.test');
        $this->api($u)->postJson('/api/v1/early/redeem', ['code' => $inv->code])->assertStatus(410);
        $this->assertSame(0, Accounts::balance($u->id));
    }

    /** 6. a different e-mail: activated, email_mismatch = true */
    public function test_email_mismatch_is_allowed_and_flagged()
    {
        $u = $this->client('someone-else@example.test');
        $inv = $this->invite(['email' => 'invited@example.test']);
        $this->api($u)->postJson('/api/v1/early/redeem', ['code' => $inv->code])->assertOk()->assertJsonPath('status', 'redeemed');
        $this->assertTrue($inv->fresh()->email_mismatch);
        $this->assertSame(5000, Accounts::balance($u->id));
    }

    /** 7. no early access: credits/TTS closed before 27 November, open from 27 November */
    public function test_feature_gate_before_and_after_public_launch()
    {
        $u = $this->client('regular@example.test');
        $this->api($u)->getJson('/api/v1/credits')->assertStatus(403)->assertJsonPath('redirect', '/ar/waitlist');
        $this->api($u)->postJson('/api/v1/generations', ['text' => 'نص تجريبي', 'voiceId' => 'x'])->assertStatus(403);
        $this->api($u)->getJson('/api/v1/auth/me')->assertJsonPath('features.newFeatures', false);
        $this->assertFalse(canUseNewFeatures($u));

        $this->travelTo($this->cairo('2026-11-27 00:00:00'));
        $this->api($u)->getJson('/api/v1/credits')->assertOk();
        $this->api($u)->getJson('/api/v1/auth/me')->assertJsonPath('features.newFeatures', true);
        $this->assertTrue(canUseNewFeatures($u));
    }

    /** 8. a Rowad member subscribing before 26 November: discounted and locked until rowad_price_until; after: list price */
    public function test_rowad_subscription_price_is_locked()
    {
        $u = $this->client('sub@example.test');
        $this->api($u)->postJson('/api/v1/early/redeem', ['code' => $this->invite()->code])->assertOk();
        $this->api($u)->postJson('/api/v1/billing/change-plan', ['planId' => 'plan-starter'])
            ->assertOk()->assertJsonPath('priceUsd', 16)->assertJsonPath('offer', 'rowad');   // 20 USD − 20%
        $acc = DB::table('qv_client_accounts')->where('user_id', $u->id)->first();
        $this->assertSame('plan-starter', $acc->locked_plan_id);
        $this->assertEquals($u->fresh()->rowad_price_until, Carbon::parse($acc->locked_until));

        // renewal after the early window: still the locked price
        $this->travelTo($this->cairo('2027-01-15 10:00:00'));
        $this->api($u)->postJson('/api/v1/billing/change-plan', ['planId' => 'plan-starter'])
            ->assertOk()->assertJsonPath('priceUsd', 16)->assertJsonPath('offer', 'rowad_locked');

        // a Rowad member who subscribes for the first time after 26 November: list price
        $late = $this->client('late-sub@example.test');
        $late->forceFill(['early_access' => true, 'rowad_badge_at' => $this->cairo('2026-11-21 09:00:00'),
            'rowad_price_until' => $this->cairo('2027-11-21 09:00:00')])->save();
        $this->travelTo($this->cairo('2026-11-27 08:00:00'));
        $this->api($late)->postJson('/api/v1/billing/change-plan', ['planId' => 'plan-starter'])
            ->assertOk()->assertJsonPath('priceUsd', 20)->assertJsonPath('offer', null);
    }

    /** 9. Rowad price and White Friday: only the larger one */
    public function test_rowad_and_white_friday_are_not_combined()
    {
        $u = $this->client('wf@example.test');
        $this->api($u)->postJson('/api/v1/early/redeem', ['code' => $this->invite()->code])->assertOk();
        $plan = ['id' => 'plan-starter', 'priceUsd' => 20];

        config(['rowad.white_friday.discount_pct' => 30]);   // White Friday larger than Rowad (20%)
        $q = RowadService::subscriptionPrice($u->fresh(), $plan);
        $this->assertSame('white_friday', $q['offer']);
        $this->assertEquals(14.0, $q['price']);
        $this->assertNull($q['lock']);

        config(['rowad.white_friday.discount_pct' => 10]);   // Rowad larger
        $q = RowadService::subscriptionPrice($u->fresh(), $plan);
        $this->assertSame('rowad', $q['offer']);
        $this->assertEquals(16.0, $q['price']);

        // top-up: Rowad gift = +20% characters (worth 16.7% off) vs White Friday price cut
        $t = RowadService::topupPrice($u->fresh(), 20.0, 25000);
        $this->assertSame(['rowad', 5000, 20.0], [$t['offer'], $t['bonusChars'], $t['price']]);
        config(['rowad.white_friday.discount_pct' => 25]);
        $t = RowadService::topupPrice($u->fresh(), 20.0, 25000);
        $this->assertSame(['white_friday', 0, 15.0], [$t['offer'], $t['bonusChars'], $t['price']]);
    }

    /** 10. after 30 days: an «expire» entry and the free balance is zero; spending takes from the soonest expiry first */
    public function test_free_credits_expire_after_30_days()
    {
        $u = $this->client('expire@example.test');
        $this->api($u)->postJson('/api/v1/early/redeem', ['code' => $this->invite()->code])->assertOk();
        $this->assertTrue(Accounts::deductCredits($u->id, $u->id, 1200, 'gen-test', 'test'));
        $this->assertSame(3800, RowadService::freeGrant($u->id)['remaining']);

        $this->travelTo(now()->addDays(31));
        $this->assertSame(0, Accounts::balance($u->id));   // lapsed even before the job runs
        (new ExpireTtsCredits)->handle();
        $this->assertSame(1, DB::table('qv_credit_transactions')->where('user_id', $u->id)->where('type', 'expire')->where('delta', -3800)->count());
        $this->assertSame(0, Accounts::balance($u->id));
        $this->assertSame(0, RowadService::freeGrant($u->id)['remaining']);
        (new ExpireTtsCredits)->handle();   // running again writes nothing new
        $this->assertSame(1, DB::table('qv_credit_transactions')->where('user_id', $u->id)->where('type', 'expire')->count());
    }

    /** 11. more than 10 attempts per hour from one IP: refused for a while */
    public function test_rate_limit_on_invite_links()
    {
        for ($i = 1; $i <= 10; $i++) $this->get('/ar/early?code=WRONGCODE' . $i)->assertStatus(302);
        $this->get('/ar/early?code=WRONGCODE11')->assertStatus(429)->assertSee('"state":"rate_limited"', false);
        $this->travelTo(now()->addMinutes(61));
        $this->get('/ar/early?code=WRONGCODE12')->assertStatus(302);
    }

    /** generator: 10-character codes without look-alike characters, export file, no second invite without --force */
    public function test_generate_invites_command()
    {
        $u = $this->client('csv@example.test');
        $csv = storage_path('app/rowad_test_clients.csv');
        file_put_contents($csv, "client_id,name,email,phone\n{$u->id},عميل,,\n,عميلة ثانية,second@example.test,+966500000001\n,,,\n");
        $this->artisan('rowad:generate-invites', ['csv' => $csv])->assertExitCode(0);
        $this->artisan('rowad:generate-invites', ['csv' => $csv])->assertExitCode(0);
        $this->assertSame(2, Invite::count());
        $this->artisan('rowad:generate-invites', ['csv' => $csv, '--force' => true])->assertExitCode(0);
        $this->assertSame(4, Invite::count());
        foreach (Invite::pluck('code') as $code) $this->assertMatchesRegularExpression('/^[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{10}$/', $code);

        $rows = array_map('str_getcsv', file(storage_path('app/rowad_invites_export.csv'), FILE_IGNORE_NEW_LINES));
        $this->assertSame(['name', 'email', 'phone', 'code', 'email_link', 'whatsapp_link'], array_map(fn ($h) => preg_replace('/^\xEF\xBB\xBF/', '', $h), $rows[0]));
        $this->assertStringContainsString('/ar/early?code=' . $rows[1][3] . '&utm_source=email&utm_medium=invite&utm_campaign=rowad', $rows[1][4]);
        $this->assertStringContainsString('utm_source=whatsapp', $rows[1][5]);
        @unlink($csv);
    }
}
