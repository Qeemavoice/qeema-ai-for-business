<?php

namespace App\QeemaChat\Matching;

/**
 * منطق المطابقة والترتيب — في الخادم وليس في النموذج، حتى تكون النتائج ثابتة وقابلة للمراجعة.
 *
 * 1) فلترة صارمة: اللهجة، الجنس، التوفر، الموعد.
 * 2) نقاط: النبرة 40، نوع الاستخدام 30، الميزانية 20، وجود نسخة مستنسخة 10، والفئة العمرية ±5.
 * إذا لم يبقَ أحد بعد الفلترة يُتجاوز شرط الموعد ثم الجنس، وتُعاد النتائج مع relaxed.
 */
class TalentRanker
{
    public static function rank(array $talents, array $brief, int $limit = 5, ?string $today = null): array
    {
        $today = $today ?? date('Y-m-d');
        $daysAvailable = self::daysUntil($brief['deadline'] ?? null, $today);

        $passes = [
            ['deadline' => true, 'gender' => true],
            ['deadline' => false, 'gender' => true],
            ['deadline' => false, 'gender' => false],
        ];

        foreach ($passes as $i => $rules) {
            $pool = array_filter($talents, fn ($t) => self::passes($t, $brief, $rules, $daysAvailable));
            if ($pool) {
                $scored = array_map(fn ($t) => $t + ['score' => self::score($t, $brief)], array_values($pool));
                usort($scored, fn ($a, $b) => [$b['score'], $a['price_per_minute_usd']] <=> [$a['score'], $b['price_per_minute_usd']]);

                $relaxed = [];
                if ($i >= 1 && $daysAvailable !== null) {
                    $relaxed[] = 'deadline';
                }
                if ($i >= 2 && ($brief['gender'] ?? 'any') !== 'any') {
                    $relaxed[] = 'gender';
                }

                return ['results' => array_slice($scored, 0, $limit), 'relaxed' => $relaxed];
            }
        }

        return ['results' => [], 'relaxed' => []];
    }

    private static function passes(array $t, array $brief, array $rules, ?int $days): bool
    {
        if (empty($t['available'])) {
            return false;
        }
        if (!in_array($brief['dialect'] ?? '', $t['dialects'] ?? [], true)) {
            return false;
        }
        $gender = $brief['gender'] ?? 'any';
        if ($rules['gender'] && $gender !== 'any' && ($t['gender'] ?? '') !== $gender) {
            return false;
        }
        if ($rules['deadline'] && $days !== null && (int) ($t['turnaround_days'] ?? 99) > $days) {
            return false;
        }

        return true;
    }

    public static function score(array $t, array $brief): float
    {
        $score = 0.0;

        // النبرة: نسبة النبرات المطلوبة الموجودة عند المعلق
        $wanted = array_values(array_filter((array) ($brief['tone'] ?? [])));
        if ($wanted) {
            $have = array_map([self::class, 'norm'], $t['tones'] ?? []);
            $hits = count(array_filter($wanted, fn ($w) => in_array(self::norm($w), $have, true)));
            $score += 40 * ($hits / count($wanted));
        } else {
            $score += 20;
        }

        // نوع الاستخدام
        if (in_array($brief['use_case'] ?? '', $t['use_cases'] ?? [], true)) {
            $score += 30;
        }

        // الميزانية: كاملة إذا ضمنها أو غير معروفة، وتتناقص كلما زاد السعر عنها
        $budget = (float) ($brief['budget_usd'] ?? 0);
        $minutes = max(1.0, (float) ($brief['duration_minutes'] ?? 1));
        if ($budget <= 0) {
            $score += 20;
        } else {
            $cost = (float) $t['price_per_minute_usd'] * $minutes;
            $score += $cost <= $budget ? 20 : max(0, 20 * (1 - ($cost - $budget) / $budget));
        }

        // نسخة مستنسخة (تسمح بالمعاينة)
        if (!empty($t['has_clone'])) {
            $score += 10;
        }

        // الفئة العمرية
        $age = $brief['age_range'] ?? 'any';
        if ($age !== 'any' && !empty($t['age_range'])) {
            $score += $t['age_range'] === $age ? 5 : -5;
        }

        return round($score, 1);
    }

    public static function estimateCost(array $t, array $brief): ?array
    {
        $minutes = (float) ($brief['duration_minutes'] ?? 0);
        if ($minutes <= 0) {
            return null;
        }
        $billable = max(1, (int) ceil($minutes));
        $human = round($billable * (float) $t['price_per_minute_usd']);
        $ai = isset($t['ai_price_per_minute_usd']) && $t['ai_price_per_minute_usd'] !== null && !empty($t['has_clone'])
            ? round($billable * (float) $t['ai_price_per_minute_usd'])
            : null;

        return ['minutes' => $billable, 'human_usd' => $human, 'ai_usd' => $ai];
    }

    private static function norm(string $s): string
    {
        $s = trim($s);
        $s = str_replace(['أ', 'إ', 'آ'], 'ا', $s);
        $s = str_replace('ة', 'ه', $s);
        $s = preg_replace('/^ال/u', '', $s);

        return $s;
    }

    private static function daysUntil(?string $deadline, string $today): ?int
    {
        if (!$deadline || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $deadline)) {
            return null;
        }
        $d = (strtotime($deadline) - strtotime($today)) / 86400;

        return max(0, (int) floor($d));
    }
}
