<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Content of the new UI's dashboard at integration time (database/seeders/data/new-ui-seed.json):
 * success stories, page texts, voice production templates, services list, TTS studio voices, supervisors, settings.
 * FAQs, categories and dialects from the JSON are inserted ONLY when the old tables are empty.
 * Safe to re-run: existing rows are kept.
 *
 *   php artisan db:seed --class=NewUiSeeder
 */
class NewUiSeeder extends Seeder
{
    public function run()
    {
        $seed = json_decode(file_get_contents(__DIR__ . '/data/new-ui-seed.json'), true);
        $now = now();

        foreach (['stories', 'pageTexts', 'voiceTemplates', 'services', 'admins'] as $name) {
            foreach ($seed['collections'][$name] ?? [] as $item) {
                $id = $item['id'];
                unset($item['id']);
                if (DB::table('qv_collections')->where('id', $id)->exists()) continue;
                DB::table('qv_collections')->insert(['id' => $id, 'name' => $name, 'data' => json_encode($item, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), 'created_at' => $now, 'updated_at' => $now]);
            }
        }

        foreach ($seed['ttsVoices'] ?? [] as $v) {
            if (DB::table('qv_tts_voices')->where('id', $v['id'])->exists()) continue;
            DB::table('qv_tts_voices')->insert([
                'id' => $v['id'], 'name' => $v['name'], 'name_en' => $v['nameEn'] ?? null, 'gender' => $v['gender'] ?? 'male', 'dialect' => $v['dialect'] ?? 'gulf',
                'dialect_label' => $v['dialectLabel'] ?? '', 'style' => $v['style'] ?? 'commercial', 'style_label' => $v['styleLabel'] ?? '',
                'use_cases' => json_encode($v['useCases'] ?? ['ads']), 'provider' => $v['provider'] ?? 'qeema_acoustic', 'provider_voice_id' => $v['providerVoiceId'] ?? null,
                'preview_url' => (isset($v['previewUrl']) && strpos($v['previewUrl'], 'pixabay') === false) ? $v['previewUrl'] : null,
                'avatar' => $v['avatar'] ?? null, 'narrator_id' => $v['narratorId'] ?? null, 'narrator_share_percent' => $v['narratorSharePercent'] ?? null,
                'is_active' => !empty($v['isActive']), 'is_featured' => !empty($v['isFeatured']), 'bookings_count' => (int) ($v['bookingsCount'] ?? 0),
                'created_at' => $now, 'updated_at' => $now,
            ]);
        }

        if (!DB::table('qv_kv')->where('key', 'systemSettings')->exists() && !empty($seed['systemSettings'])) {
            DB::table('qv_kv')->insert(['key' => 'systemSettings', 'value' => json_encode($seed['systemSettings'], JSON_UNESCAPED_UNICODE), 'created_at' => $now, 'updated_at' => $now]);
        }

        // Lists for the old tables only when they are empty (a fresh database)
        if (\Illuminate\Support\Facades\Schema::hasTable('faqs') && DB::table('faqs')->count() === 0) {
            foreach ($seed['collections']['faqs'] ?? [] as $i => $f) {
                DB::table('faqs')->insert(['title' => json_encode(['ar' => $f['question'], 'en' => $f['question']], JSON_UNESCAPED_UNICODE),
                    'details' => json_encode(['ar' => $f['answer'], 'en' => $f['answer']], JSON_UNESCAPED_UNICODE), 'faq_status' => YES, 'sort' => $i + 1, 'created_at' => $now, 'updated_at' => $now]);
            }
        }
        if (\Illuminate\Support\Facades\Schema::hasTable('categories') && DB::table('categories')->count() === 0) {
            foreach ($seed['collections']['categories'] ?? [] as $c) {
                DB::table('categories')->insert(['name' => json_encode(['ar' => $c['name'], 'en' => $c['name']], JSON_UNESCAPED_UNICODE), 'created_at' => $now, 'updated_at' => $now]);
            }
        }
    }
}
