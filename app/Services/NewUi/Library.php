<?php

namespace App\Services\NewUi;

use App\Models\Voice;
use App\Models\VoiceStatus;
use App\Models\VoiceType;

/**
 * The human voice library shown by the new UI (/api/v1/human-voices, booking pages, reviews).
 * Source: the accepted rows of the old `voices` table (samples of the voice actors), plus samples the admin
 * approved in the new narrator dashboard that were not yet written to `voices`.
 * Ids: "v{voices.id}" for old rows, "ns-{sample id}" for dashboard samples.
 */
class Library
{
    private static $cache = null;

    /** Drop the per-request list after a voice was changed */
    public static function forget(): void
    {
        self::$cache = null;
    }

    /** The clip name a client may see: never the narrator's name, even when a clip was titled with it */
    public static function safeClip(?string $clip, ?string $narrator, ?string $category = ''): string
    {
        $clip = trim((string) $clip); $narrator = trim((string) $narrator);
        if ($clip !== '' && ($narrator === '' || mb_strpos($clip, $narrator) === false)) return $clip;
        return trim((string) $category) ?: 'عينة صوتية';
    }

    /** Clip name of any voice row (also hidden/removed ones), never the narrator's name */
    public static function clipName(?string $id): string
    {
        $v = ctype_digit((string) $id) ? Voice::withoutGlobalScopes()->find((int) $id) : null;
        return $v ? self::tr($v, 'title') : '';
    }

    private static function tr($model, string $field): string
    {
        if (!$model) return '';
        try { $v = $model->getTranslation($field, 'ar', false) ?: $model->getTranslation($field, 'en', false); } catch (\Throwable $e) { $v = $model->{$field} ?? ''; }
        if (!$v) {
            $raw = $model->getAttributes()[$field] ?? '';
            $d = is_string($raw) ? json_decode($raw, true) : null;
            $v = is_array($d) ? (reset($d) ?: '') : (string) $raw;
        }
        return (string) $v;
    }

    public static function fromVoice(Voice $v, float $pct): array
    {
        $actor = $v->voiceOver;
        $dialect = $v->dialect;
        // every category of the voice (voice_categories), not only the first
        $catRels = $v->categories->filter(fn ($c) => $c->category);
        $cats = $catRels->map(fn ($c) => self::tr($c->category, 'name'))->filter()->unique()->values()->all();
        $category = $cats[0] ?? '';
        $catRel = $catRels->first();
        $title = self::tr($v, 'title');
        $narratorPrice = (float) $v->price_per_minute;
        $gender = (int) $v->voice_type_id === VoiceType::VOICE_TYPE_WOMEN ? 'female' : 'male';
        return [
            'id' => (string) $v->id,            // numeric like the old site, so old /ar/booking/{id}-{title} URLs still match
            'name' => $actor ? Accounts::name($actor) : $title,
            'talentName' => $actor ? Accounts::name($actor) : '',
            'sampleName' => $title,
            'subtitle' => $title,
            'description' => self::tr($v, 'meta_description'),
            'metaTitle' => self::tr($v, 'meta_title'),
            'metaDescription' => self::tr($v, 'meta_description'),
            'gender' => $gender,
            'language' => $v->language ? self::tr($v->language, 'name') : 'العربية',
            'flag' => '',
            'accent' => $dialect ? self::tr($dialect, 'name') : '',
            'dialect' => $dialect ? self::tr($dialect, 'name') : '',
            'extraAccentsCount' => 0,
            'license' => 'ترخيص تجاري شامل', 'licenseTooltip' => '',
            'usageCount' => (string) ((int) $v->number_of_listened),
            'bookingsCount' => (int) $v->number_of_orders,
            'category' => $category, 'categories' => $cats, 'tags' => $cats, 'categoryKey' => 'custom',
            'glassGradient' => 'radial-gradient(circle at 30% 30%, #FFA513 0%, #7c2d12 60%, #1c1917 100%)',
            'previewUrl' => (string) $v->audio_file_url,
            'isVerified' => true, 'isHuman' => true, 'status' => 'active',
            'narratorPriceUsd' => $narratorPrice,
            'finalPriceUsd' => Plans::finalPrice($narratorPrice ?: Bookings::DEFAULT_PRICE_PER_MINUTE_USD, $pct),
            'trustYears' => '', 'turnaround' => '48h',
            'createdAt' => Store::iso(Store::created($v, 'created_at')),
            // internal (stripped from public answers)
            '_talentUserId' => (int) $v->voiceover_id, '_voiceRowId' => (int) $v->id, '_audioFile' => (string) $v->audio_file,
            '_languageId' => $v->language_id, '_dialectId' => $v->dialect_id, '_voiceTypeId' => $v->voice_type_id,
            '_categoryId' => $catRel ? $catRel->category_id : null,
        ];
    }

    private static function fromSample(array $s, array $n, float $pct): array
    {
        $price = (float) ($s['pricePerMinute'] ?? ($n['rates']['perMinuteUsd'] ?? 0));
        $uid = (int) str_replace('narrator_u', '', (string) ($s['narratorId'] ?? ''));
        return [
            'id' => 'ns-' . $s['id'], 'name' => $n['displayName'] ?? '', 'talentName' => $n['displayName'] ?? '', 'sampleName' => $s['title'] ?? '', 'subtitle' => $s['title'] ?? '',
            'description' => '', 'metaTitle' => '', 'metaDescription' => '', 'gender' => 'male', 'language' => 'العربية', 'flag' => '',
            'accent' => $s['dialect'] ?? '', 'dialect' => $s['dialect'] ?? '', 'extraAccentsCount' => 0, 'license' => 'ترخيص تجاري شامل', 'licenseTooltip' => '',
            'usageCount' => '0', 'bookingsCount' => 0, 'category' => $s['category'] ?? '', 'categories' => !empty($s['category']) ? [$s['category']] : [], 'tags' => !empty($s['category']) ? [$s['category']] : [],
            'categoryKey' => 'custom', 'glassGradient' => 'radial-gradient(circle at 30% 30%, #FFA513 0%, #7c2d12 60%, #1c1917 100%)',
            'previewUrl' => (string) ($s['audioUrl'] ?? ''), 'isVerified' => ($n['humanBadge'] ?? '') === 'verified', 'isHuman' => true, 'status' => 'active',
            'narratorPriceUsd' => $price, 'finalPriceUsd' => Plans::finalPrice($price ?: Bookings::DEFAULT_PRICE_PER_MINUTE_USD, $pct),
            'trustYears' => '', 'turnaround' => '48h', 'createdAt' => $s['createdAt'] ?? '',
            '_talentUserId' => $uid, '_voiceRowId' => 0, '_audioFile' => '', '_languageId' => null, '_dialectId' => null, '_voiceTypeId' => null, '_categoryId' => null,
        ];
    }

    /** Every active library voice with the internal fields */
    public static function all(): array
    {
        if (self::$cache !== null) return self::$cache;
        $pct = Plans::commissionPercent();
        $out = [];
        foreach (Voice::with(['voiceOver', 'dialect', 'language', 'categories.category'])->where('voice_status_id', VoiceStatus::ACCEPTED)->orderByDesc('number_of_orders')->get() as $v) {
            $out[] = self::fromVoice($v, $pct);
        }
        $st = \App\Http\Controllers\NewUi\NarratorController::state();
        $narrators = [];
        foreach ($st['narrators'] as $n) $narrators[$n['id']] = $n;
        foreach ($st['voiceSamples'] as $s) {
            if (($s['status'] ?? '') !== 'published' || !empty($s['voiceRowId']) || !empty($s['oldSampleId'])) continue;
            $n = $narrators[$s['narratorId'] ?? ''] ?? null;
            if (!$n || ($n['status'] ?? '') === 'suspended') continue;
            $out[] = self::fromSample($s, $n, $pct);
        }
        return self::$cache = $out;
    }

    public static function byId(): array
    {
        $m = [];
        foreach (self::all() as $v) $m[$v['id']] = $v;
        return $m;
    }

    public static function find(string $id): ?array
    {
        $v = self::byId()[$id] ?? null;
        if (!$v) return null;
        return array_merge($v, ['talentUserId' => $v['_talentUserId'], 'voiceRowId' => $v['_voiceRowId'], 'audioFile' => $v['_audioFile'],
            'languageId' => $v['_languageId'], 'dialectId' => $v['_dialectId'], 'voiceTypeId' => $v['_voiceTypeId'], 'categoryId' => $v['_categoryId']]);
    }

    /** Without the internal fields, and without the narrator's name (public pages show the clip name only) */
    public static function publicItems(): array
    {
        return array_map(fn ($v) => array_merge(array_filter($v, fn ($k) => $k[0] !== '_', ARRAY_FILTER_USE_KEY),
            ['name' => self::safeClip($v['sampleName'], $v['talentName'], $v['category']), 'sampleName' => self::safeClip($v['sampleName'], $v['talentName'], $v['category']), 'talentName' => '',
             // SEO and description texts typed in the dashboard follow the same rule (they feed the page title and Google)
             'subtitle' => self::without($v['subtitle'] ?? '', $v['talentName']), 'description' => self::without($v['description'] ?? '', $v['talentName']),
             'metaTitle' => self::without($v['metaTitle'] ?? '', $v['talentName']), 'metaDescription' => self::without($v['metaDescription'] ?? '', $v['talentName'])]), self::all());
    }

    /** The text, or '' when it carries the narrator's name */
    public static function without(?string $text, ?string $narrator): string
    {
        $text = trim((string) $text); $narrator = trim((string) $narrator);
        return $narrator !== '' && mb_strpos($text, $narrator) !== false ? '' : $text;
    }

    /** One voice as the public sees it (publicItems' rules), or null */
    public static function publicItem(string $id): ?array
    {
        foreach (self::publicItems() as $v) if ($v['id'] === $id) return $v;
        return null;
    }
}
