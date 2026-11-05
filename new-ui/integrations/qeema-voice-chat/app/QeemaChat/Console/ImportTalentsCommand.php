<?php

namespace App\QeemaChat\Console;

use App\QeemaChat\Support\ToolDefinitions;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * استيراد ملفات المعلقين من CSV (يُصدَّر من شيت بيانات المعلقين).
 * الاستخدام: php artisan qv-chat:import-talents storage/app/talents.csv
 * الصفوف تُحدَّث حسب talent_code، فيمكن إعادة الاستيراد بعد كل تحديث للشيت.
 */
class ImportTalentsCommand extends Command
{
    protected $signature = 'qv-chat:import-talents {file : مسار ملف CSV} {--dry-run : فحص الملف بدون حفظ}';

    protected $description = 'استيراد أو تحديث ملفات المعلقين لشات اختيار الصوت';

    private const DIALECT_ALIASES = [
        'سعودي نجدي' => 'sa_najdi', 'نجدي' => 'sa_najdi', 'سعودي' => 'sa_najdi',
        'سعودي حجازي' => 'sa_hijazi', 'حجازي' => 'sa_hijazi',
        'إماراتي' => 'ae', 'اماراتي' => 'ae', 'كويتي' => 'kw', 'قطري' => 'qa',
        'مصري' => 'eg', 'شامي' => 'levant', 'لبناني' => 'levant', 'سوري' => 'levant',
        'أردني' => 'jo_ps', 'فلسطيني' => 'jo_ps', 'أردني فلسطيني' => 'jo_ps',
        'عراقي' => 'iq', 'مغربي' => 'ma', 'فصحى' => 'msa', 'فصحي' => 'msa',
    ];

    private const USE_CASE_ALIASES = [
        'إعلان' => 'ad', 'إعلانات' => 'ad', 'اعلان' => 'ad', 'اعلانات' => 'ad',
        'تعريفي' => 'corporate', 'مؤسسي' => 'corporate', 'فيديو تعريفي' => 'corporate',
        'تعليمي' => 'elearning', 'تعليم إلكتروني' => 'elearning',
        'رد آلي' => 'ivr', 'رد الي' => 'ivr', 'بودكاست' => 'podcast',
        'دبلجة' => 'dubbing', 'كتاب صوتي' => 'audiobook', 'كتب صوتية' => 'audiobook',
    ];

    private const REQUIRED = ['talent_code', 'name', 'dialects', 'gender', 'tones', 'use_cases', 'price_per_minute_usd', 'sample_url'];

    public function handle(): int
    {
        $file = $this->argument('file');
        if (!is_readable($file)) {
            $this->error("الملف غير موجود: {$file}");

            return self::FAILURE;
        }

        $fh = fopen($file, 'r');
        $header = fgetcsv($fh);
        if (!$header) {
            $this->error('الملف فارغ');

            return self::FAILURE;
        }
        $header = array_map(fn ($h) => trim(preg_replace('/^\xEF\xBB\xBF/', '', $h)), $header);

        $missing = array_diff(self::REQUIRED, $header);
        if ($missing) {
            $this->error('أعمدة ناقصة: ' . implode(', ', $missing));

            return self::FAILURE;
        }

        $ok = 0;
        $errors = [];
        $line = 1;
        while (($cells = fgetcsv($fh)) !== false) {
            $line++;
            if (count(array_filter($cells, fn ($c) => trim((string) $c) !== '')) === 0) {
                continue;
            }
            $row = array_combine($header, array_pad(array_slice($cells, 0, count($header)), count($header), ''));

            [$record, $problems] = $this->map($row);
            if ($problems) {
                $errors[] = "سطر {$line} ({$row['talent_code']}): " . implode('، ', $problems);
                continue;
            }

            if (!$this->option('dry-run')) {
                $exists = DB::table('qv_chat_talents')->where('talent_code', $record['talent_code'])->exists();
                if ($exists) {
                    DB::table('qv_chat_talents')->where('talent_code', $record['talent_code'])->update($record + ['updated_at' => now()]);
                } else {
                    DB::table('qv_chat_talents')->insert($record + ['created_at' => now(), 'updated_at' => now()]);
                }
            }
            $ok++;
        }
        fclose($fh);

        $this->info("تم: {$ok} معلق" . ($this->option('dry-run') ? ' (فحص فقط، لم يُحفظ شيء)' : ''));
        foreach ($errors as $e) {
            $this->warn($e);
        }

        return self::SUCCESS;
    }

    private function map(array $r): array
    {
        $problems = [];

        foreach (self::REQUIRED as $k) {
            if (trim((string) ($r[$k] ?? '')) === '') {
                $problems[] = "الحقل {$k} فارغ";
            }
        }

        $dialects = $this->list($r['dialects'] ?? '', self::DIALECT_ALIASES, ToolDefinitions::DIALECTS, $problems, 'لهجة');
        $useCases = $this->list($r['use_cases'] ?? '', self::USE_CASE_ALIASES, ToolDefinitions::USE_CASES, $problems, 'استخدام');
        $tones = array_values(array_filter(array_map('trim', preg_split('/[;؛,،|]/u', (string) ($r['tones'] ?? '')))));

        $gender = match (trim(mb_strtolower((string) ($r['gender'] ?? '')))) {
            'male', 'm', 'ذكر', 'رجل' => 'male',
            'female', 'f', 'أنثى', 'انثى', 'امرأة' => 'female',
            default => null,
        };
        if (!$gender) {
            $problems[] = 'الجنس غير معروف';
        }

        $age = match (trim((string) ($r['age_range'] ?? ''))) {
            'young', 'شاب', 'شابة' => 'young',
            'middle', 'متوسط', 'متوسطة' => 'middle',
            'mature', 'ناضج', 'ناضجة', 'كبير' => 'mature',
            default => null,
        };

        $hasClone = $this->bool($r['has_clone'] ?? '0');
        $voiceId = trim((string) ($r['elevenlabs_voice_id'] ?? '')) ?: null;
        $consent = trim((string) ($r['clone_consent_date'] ?? '')) ?: null;
        if ($hasClone && (!$voiceId || !$consent)) {
            $problems[] = 'معلق مستنسخ بدون voice_id أو تاريخ موافقة — لن يُستورد قبل استكمالهما';
        }

        $price = (float) ($r['price_per_minute_usd'] ?? 0);
        if ($price <= 0) {
            $problems[] = 'السعر غير صحيح';
        }

        $record = [
            'talent_code' => strtoupper(trim((string) $r['talent_code'])),
            'legacy_user_id' => is_numeric($r['legacy_user_id'] ?? null) ? (int) $r['legacy_user_id'] : null,
            'name' => trim((string) $r['name']),
            'dialects' => json_encode($dialects),
            'gender' => $gender,
            'age_range' => $age,
            'tones' => json_encode($tones, JSON_UNESCAPED_UNICODE),
            'use_cases' => json_encode($useCases),
            'price_per_minute_usd' => $price,
            'turnaround_days' => max(1, (int) ($r['turnaround_days'] ?? 3) ?: 3),
            'available' => ($r['available'] ?? '') === '' ? true : $this->bool($r['available']),
            'sample_url' => trim((string) $r['sample_url']),
            'photo_url' => trim((string) ($r['photo_url'] ?? '')) ?: null,
            'profile_url' => trim((string) ($r['profile_url'] ?? '')) ?: null,
            'has_clone' => $hasClone,
            'elevenlabs_voice_id' => $voiceId,
            'clone_consent_date' => $consent,
            'ai_price_per_minute_usd' => is_numeric($r['ai_price_per_minute_usd'] ?? null) ? (float) $r['ai_price_per_minute_usd'] : null,
            'verified_human' => ($r['verified_human'] ?? '') === '' ? true : $this->bool($r['verified_human']),
        ];

        return [$record, $problems];
    }

    private function list(string $raw, array $aliases, array $valid, array &$problems, string $label): array
    {
        $out = [];
        foreach (preg_split('/[;؛,،|]/u', $raw) as $item) {
            $item = trim($item);
            if ($item === '') {
                continue;
            }
            $code = in_array($item, $valid, true) ? $item : ($aliases[$item] ?? null);
            if ($code) {
                $out[] = $code;
            } else {
                $problems[] = "{$label} غير معروفة: {$item}";
            }
        }

        return array_values(array_unique($out));
    }

    private function bool(string $v): bool
    {
        return in_array(trim(mb_strtolower($v)), ['1', 'yes', 'true', 'نعم', 'y'], true);
    }
}
