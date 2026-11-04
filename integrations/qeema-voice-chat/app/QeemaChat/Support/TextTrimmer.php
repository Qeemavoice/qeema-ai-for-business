<?php

namespace App\QeemaChat\Support;

/**
 * يقص نص المعاينة إلى حد أقصى من الحروف، ويفضّل القطع عند نهاية جملة.
 * ElevenLabs تحسب الرصيد بالحروف (بما فيها المسافات والتشكيل)، لذا الحد بالحروف لا بالثواني.
 */
class TextTrimmer
{
    public static function forPreview(string $text, int $maxChars): array
    {
        $clean = self::normalize($text);
        $length = mb_strlen($clean);

        if ($length <= $maxChars) {
            return ['text' => $clean, 'trimmed' => false, 'chars' => $length];
        }

        $cut = mb_substr($clean, 0, $maxChars);

        // ابحث عن آخر نهاية جملة في الثلث الأخير من المقطع
        $minPos = (int) floor($maxChars * 0.6);
        $best = -1;
        foreach (['.', '!', '؟', '?', '…', "\n", '،', ','] as $mark) {
            $pos = mb_strrpos($cut, $mark);
            if ($pos !== false && $pos >= $minPos && $pos > $best) {
                $best = $pos;
            }
        }

        if ($best === -1) {
            // لا توجد نهاية جملة: اقطع عند آخر مسافة حتى لا تنقطع كلمة
            $space = mb_strrpos($cut, ' ');
            $best = ($space !== false && $space >= $minPos) ? $space - 1 : $maxChars - 1;
        }

        $result = rtrim(mb_substr($cut, 0, $best + 1), " ،,");

        return ['text' => $result, 'trimmed' => true, 'chars' => mb_strlen($result)];
    }

    /** يحذف المسافات والأسطر الزائدة لأنها تُحسب من الرصيد */
    public static function normalize(string $text): string
    {
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        $text = preg_replace('/[ \t\x{00A0}]+/u', ' ', $text);
        $text = preg_replace('/\n{2,}/u', "\n", $text);
        // حذف التطويل (ـ) لأنه حرف مدفوع بلا فائدة صوتية
        $text = str_replace('ـ', '', $text);

        return trim($text);
    }
}
