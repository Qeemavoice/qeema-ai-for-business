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

    public function test_signed_in_account_changes_its_password()
    {
        $u = $this->account();
        $u->forceFill(['password' => Hash::make('old-pass-123')])->save();
        $token = $this->postJson('/api/v1/auth/login', ['email' => $u->email, 'password' => 'old-pass-123'])->assertOk()->json('token');
        $h = ['Authorization' => 'Bearer ' . $token];
        $this->postJson('/api/v1/auth/password', ['currentPassword' => 'old-pass-123', 'newPassword' => 'new-pass-123'])->assertStatus(401);
        $this->postJson('/api/v1/auth/password', ['currentPassword' => 'wrong', 'newPassword' => 'new-pass-123'], $h)->assertStatus(400);
        $this->postJson('/api/v1/auth/password', ['currentPassword' => 'old-pass-123', 'newPassword' => 'short'], $h)->assertStatus(400);
        $this->postJson('/api/v1/auth/password', ['currentPassword' => 'old-pass-123', 'newPassword' => 'new-pass-123'], $h)->assertOk();
        $this->assertTrue(Hash::check('new-pass-123', $u->fresh()->password));
    }

    public function test_signed_in_account_edits_its_profile()
    {
        $u = $this->account();
        $u->forceFill(['password' => Hash::make('old-pass-123')])->save();
        $h = ['Authorization' => 'Bearer ' . $this->postJson('/api/v1/auth/login', ['email' => $u->email, 'password' => 'old-pass-123'])->json('token')];
        $this->getJson('/api/v1/auth/profile')->assertStatus(401);
        $this->getJson('/api/v1/auth/profile', $h)->assertOk()->assertJsonPath('email', $u->email);
        $this->putJson('/api/v1/auth/profile', ['name' => 'x'], $h)->assertStatus(400);
        $this->putJson('/api/v1/auth/profile', ['name' => 'سارة', 'mobile' => '0555'], $h)->assertStatus(400);
        $this->putJson('/api/v1/auth/profile', ['name' => 'سارة أحمد', 'mobile' => '+966 555 123 456', 'country' => 'الإمارات'], $h)
            ->assertOk()->assertJsonPath('user.name', 'سارة أحمد');
        $this->getJson('/api/v1/auth/profile', $h)->assertJsonPath('mobile', '+966555123456')->assertJsonPath('country', 'الإمارات');
        $this->putJson('/api/v1/auth/profile', ['name' => 'سارة أحمد', 'companyName' => 'شركة الصوت'], $h)->assertOk();
        $this->getJson('/api/v1/auth/profile', $h)->assertJsonPath('companyName', 'شركة الصوت');
        $this->getJson('/api/v1/auth/me', $h)->assertJsonPath('company.name', 'شركة الصوت');
    }

    public function test_signed_in_account_uploads_a_profile_photo()
    {
        $u = $this->account();
        $u->forceFill(['password' => Hash::make('old-pass-123')])->save();
        $h = ['Authorization' => 'Bearer ' . $this->postJson('/api/v1/auth/login', ['email' => $u->email, 'password' => 'old-pass-123'])->json('token')];
        $this->post('/api/v1/auth/avatar', ['image' => \Illuminate\Http\UploadedFile::fake()->create('x.pdf', 10, 'application/pdf')], $h + ['Accept' => 'application/json'])->assertStatus(400);
        $avatar = $this->post('/api/v1/auth/avatar', ['image' => \Illuminate\Http\UploadedFile::fake()->image('me.png', 64, 64)], $h + ['Accept' => 'application/json'])
            ->assertOk()->json('user.avatar');
        $file = public_path('uploads/users/' . $u->fresh()->image);
        $this->assertStringContainsString('/uploads/users/qv-' . $u->id . '-', $avatar);
        $this->assertFileExists($file);
        $this->deleteJson('/api/v1/auth/avatar', [], $h)->assertOk()->assertJsonPath('user.avatar', null);
        $this->assertFileDoesNotExist($file);
    }

    public function test_narrator_signup_needs_a_whatsapp_number()
    {
        $this->account();
        DB::table('user_types')->insert(['id' => 3, 'name' => 'voice_actor', 'slug' => 'voice_actor']);
        $base = ['name' => 'معلق', 'email' => 'narrator@example.test', 'password' => 'pass-12345', 'accountType' => 'talent'];
        $this->postJson('/api/v1/auth/signup', $base)->assertStatus(400);
        $this->postJson('/api/v1/auth/signup', $base + ['whatsapp' => '+966 0'])->assertStatus(400);
        $this->postJson('/api/v1/auth/signup', $base + ['whatsapp' => '+966 55 123 4567'])->assertOk();
        $this->assertSame('+966551234567', Accounts::findByEmail('narrator@example.test')->mobile);
    }
}
