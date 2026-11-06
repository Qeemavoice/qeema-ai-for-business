<?php

namespace Tests\Feature;

use App\Services\NewUi\Accounts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

/** «نسيت كلمة المرور؟» and Google sign-in for accounts made without a password */
class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    private function account(): \App\Models\User
    {
        foreach ([1 => 'admin', 2 => 'client'] as $id => $slug) DB::table('user_types')->insert(['id' => $id, 'name' => $slug, 'slug' => $slug]);
        foreach (range(1, 4) as $id) DB::table('user_statuses')->insert(['id' => $id, 'name' => 'status ' . $id]);
        return Accounts::createAccount('عميل', 'nopass@example.test', null, 'client');   // like accounts first made through Google
    }

    public function test_forgot_then_reset_sets_a_password_and_signs_in()
    {
        $u = $this->account();
        $this->postJson('/api/v1/auth/forgot', ['email' => 'nobody@example.test'])->assertOk();   // same answer for unknown emails
        $this->postJson('/api/v1/auth/forgot', ['email' => 'NoPass@example.test'])->assertOk();
        $this->assertSame(1, DB::table('password_resets')->where('email', $u->email)->count());

        $token = Password::broker()->createToken($u);
        $this->postJson('/api/v1/auth/reset', ['email' => $u->email, 'token' => 'wrong', 'password' => 'new-pass-123'])->assertStatus(400);
        $this->postJson('/api/v1/auth/reset', ['email' => $u->email, 'token' => $token, 'password' => 'short'])->assertStatus(400);
        $this->postJson('/api/v1/auth/reset', ['email' => $u->email, 'token' => $token, 'password' => 'new-pass-123'])->assertOk()->assertJsonStructure(['token', 'user']);
        $this->assertTrue(Hash::check('new-pass-123', $u->fresh()->password));
        $this->postJson('/api/v1/auth/reset', ['email' => $u->email, 'token' => $token, 'password' => 'again-123456'])->assertStatus(400);   // one-time link
        $this->postJson('/api/v1/auth/login', ['email' => $u->email, 'password' => 'new-pass-123'])->assertOk();
    }

    public function test_google_token_must_belong_to_our_client()
    {
        $u = $this->account();
        config(['services.google.client_id' => 'our-client.apps.googleusercontent.com']);
        Http::fake([
            'oauth2.googleapis.com/tokeninfo*' => Http::sequence()->push(['aud' => 'another-app.apps.googleusercontent.com'])->push(['aud' => 'our-client.apps.googleusercontent.com']),
            'www.googleapis.com/oauth2/v3/userinfo' => Http::response(['email' => $u->email, 'email_verified' => true, 'name' => 'عميل']),
        ]);
        $this->postJson('/api/v1/auth/google', ['accessToken' => 'token-from-another-app'])->assertStatus(401);
        $this->postJson('/api/v1/auth/google', ['accessToken' => 'our-token'])->assertOk()->assertJsonPath('user.email', $u->email);
    }
}
