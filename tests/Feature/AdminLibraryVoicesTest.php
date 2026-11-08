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

        // categories go to voice_categories (several per voice), and the library shows all of them
        DB::table('categories')->insert([['id' => 7, 'name' => json_encode(['ar' => 'إعلانات', 'en' => 'إعلانات'])], ['id' => 8, 'name' => json_encode(['ar' => 'وثائقي', 'en' => 'وثائقي'])]]);
        $api->putJson('/api/v1/admin/collections/humanVoices/501', ['categories' => ['غير موجود']])->assertStatus(400);
        $api->putJson('/api/v1/admin/collections/humanVoices/501', ['categories' => ['إعلانات', 'وثائقي']])->assertOk()
            ->assertJsonPath('item.categories', ['إعلانات', 'وثائقي']);
        $this->assertSame([7, 8], DB::table('voice_categories')->where('voice_id', 501)->orderBy('category_id')->pluck('category_id')->map(fn ($x) => (int) $x)->all());
        $public = collect($this->getJson('/api/v1/human-voices')->json('items'))->firstWhere('id', '501');
        $this->assertSame(['إعلانات', 'وثائقي'], $public['categories']);

        $api->deleteJson('/api/v1/admin/collections/humanVoices/501')->assertOk();
        $this->assertSame(1, (int) DB::table('voices')->where('id', 501)->value('voice_status_id'));   // hidden (draft), not erased
        $this->assertSame('hidden', collect($api->getJson('/api/v1/admin/collections/humanVoices')->json('items'))->firstWhere('id', '501')['status']);

        $api->postJson('/api/v1/admin/collections/humanVoices', ['sampleName' => 'جديد'])->assertStatus(400);
    }

    public function test_admin_adds_a_voice_that_shows_in_the_library_and_the_narrators_dashboard()
    {
        foreach ([1 => 'admin', 2 => 'client', 3 => 'voice-actor', 4 => 'both'] as $id => $slug) DB::table('user_types')->insert(['id' => $id, 'name' => $slug, 'slug' => $slug]);
        foreach (range(1, 4) as $id) DB::table('user_statuses')->insert(['id' => $id, 'name' => 'status ' . $id]);
        foreach ([1 => 'draft', 2 => 'review', 3 => 'accepted', 4 => 'rejected'] as $id => $n) DB::table('voice_statuses')->insert(['id' => $id, 'name' => json_encode(['ar' => $n])]);
        foreach ([1 => 'child', 2 => 'man', 3 => 'women'] as $id => $n) DB::table('voice_types')->insert(['id' => $id, 'name' => json_encode(['ar' => $n])]);
        DB::table('categories')->insert(['id' => 7, 'name' => json_encode(['ar' => 'إعلانات', 'en' => 'إعلانات'])]);
        $admin = Accounts::createAccount('مشرف', 'admin@example.test', 'password-123', 'client');
        $admin->forceFill(['user_type_id' => 1])->save();
        $narrator = Accounts::createAccount('معلق', 'narrator@example.test', 'password-123', 'talent');
        $api = $this->withHeader('Authorization', 'Bearer ' . Accounts::issueToken($admin))->withHeader('Accept', 'application/json');
        $mp3 = 'data:audio/mpeg;base64,' . base64_encode('ID3' . str_repeat("\0", 2000));
        $voice = ['sampleName' => 'إعلان جديد', 'gender' => 'male', 'categories' => ['إعلانات'], 'narratorPriceUsd' => 30, 'previewUrl' => $mp3, 'metaTitle' => 'عنوان جوجل'];

        // only admins, only a narrator with an account, only an MP3, and nothing half-saved on a refusal
        $this->postJson('/api/v1/admin/collections/humanVoices', $voice + ['narratorId' => 'narrator_u' . $narrator->id], ['Authorization' => 'Bearer ' . Accounts::issueToken($narrator)])->assertStatus(403);
        $api->postJson('/api/v1/admin/collections/humanVoices', $voice + ['narratorId' => 'narrator_u999999'])->assertStatus(400);
        $api->postJson('/api/v1/admin/collections/humanVoices', ['previewUrl' => 'data:audio/wav;base64,AAAA'] + $voice + ['narratorId' => 'narrator_u' . $narrator->id])->assertStatus(400);
        $api->postJson('/api/v1/admin/collections/humanVoices', ['categories' => ['غير موجود']] + $voice + ['narratorId' => 'narrator_u' . $narrator->id])->assertStatus(400);
        $this->assertSame(0, DB::table('voices')->count());

        $item = $api->postJson('/api/v1/admin/collections/humanVoices', $voice + ['narratorId' => 'narrator_u' . $narrator->id])->assertOk()->json('item');
        $this->assertSame('إعلان جديد', $item['sampleName']);
        $this->assertSame('active', $item['status']);
        $row = DB::table('voices')->where('id', (int) $item['id'])->first();
        $this->assertSame($narrator->id, (int) $row->voiceover_id);
        $this->assertFileExists(public_path(DIR_UPLOAD . '/' . \App\Models\Voice::DIR_VOICES_UPLOADS . '/' . $row->audio_file));

        // in the public library, and in the narrator's own dashboard («أصواتي في مكتبة الأصوات»)
        $this->assertNotNull(collect($this->getJson('/api/v1/human-voices')->json('items'))->firstWhere('id', $item['id']));
        $mine = $this->getJson('/api/v1/narrators/state', ['Authorization' => 'Bearer ' . Accounts::issueToken($narrator), 'Accept' => 'application/json'])->assertOk()->json('libraryVoices');
        $this->assertSame([$item['id']], collect($mine)->pluck('id')->all());
        // replacing the audio from «تعديل الصوت»: same voice, same address and texts, new file; a fake MP3 is refused
        $api->putJson('/api/v1/admin/collections/humanVoices/' . $item['id'], ['previewUrl' => 'data:audio/mpeg;base64,' . base64_encode("PK\x03\x04 zip renamed")])->assertStatus(400);
        $this->assertSame($row->audio_file, DB::table('voices')->where('id', (int) $item['id'])->value('audio_file'));
        $api->putJson('/api/v1/admin/collections/humanVoices/' . $item['id'], ['previewUrl' => 'data:audio/mpeg;base64,' . base64_encode("\xFF\xFB\x90\x00" . str_repeat("\0", 500))])->assertOk();
        $after = DB::table('voices')->where('id', (int) $item['id'])->first();
        $this->assertNotSame($row->audio_file, $after->audio_file);
        $this->assertSame([$row->title, $row->meta_title, (int) $row->voiceover_id], [$after->title, $after->meta_title, (int) $after->voiceover_id]);
        $this->assertSame(1, DB::table('voices')->count());

        // edit: the narrator shows and can change (the voice moves to that account), «طفل» is a voice type
        $other = Accounts::createAccount('معلق آخر', 'other@example.test', 'password-123', 'talent');
        $listed = collect($api->getJson('/api/v1/admin/collections/humanVoices')->json('items'))->firstWhere('id', $item['id']);
        $this->assertSame(['narrator_u' . $narrator->id, 'معلق'], [$listed['narratorId'], $listed['talentName']]);
        $api->putJson('/api/v1/admin/collections/humanVoices/' . $item['id'], ['narratorId' => 'narrator_u999999'])->assertStatus(400);
        $api->putJson('/api/v1/admin/collections/humanVoices/' . $item['id'], ['narratorId' => 'narrator_u' . $other->id, 'gender' => 'child'])->assertOk()
            ->assertJsonPath('item.narratorId', 'narrator_u' . $other->id)->assertJsonPath('item.gender', 'child');
        $this->assertSame([$other->id, 1], [(int) DB::table('voices')->where('id', (int) $item['id'])->value('voiceover_id'), (int) DB::table('voices')->where('id', (int) $item['id'])->value('voice_type_id')]);
        $this->assertSame('child', collect($this->getJson('/api/v1/human-voices')->json('items'))->firstWhere('id', $item['id'])['gender']);
        @unlink(public_path(DIR_UPLOAD . '/' . \App\Models\Voice::DIR_VOICES_UPLOADS . '/' . $row->audio_file));
        @unlink(public_path(DIR_UPLOAD . '/' . \App\Models\Voice::DIR_VOICES_UPLOADS . '/' . $after->audio_file));
    }
}
