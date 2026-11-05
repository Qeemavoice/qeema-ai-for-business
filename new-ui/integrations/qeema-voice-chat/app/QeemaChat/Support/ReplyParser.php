<?php

namespace App\QeemaChat\Support;

/**
 * يستخرج أزرار الاختيار السريع من رد النموذج.
 * الصيغة المتفق عليها في التعليمات: سطر أخير بالشكل [[خيار 1|خيار 2|خيار 3]]
 */
class ReplyParser
{
    public static function parse(string $text): array
    {
        $options = [];

        if (preg_match('/\[\[([^\[\]]+)\]\]\s*$/u', $text, $m)) {
            $text = trim(mb_substr($text, 0, mb_strlen($text) - mb_strlen($m[0])));
            foreach (explode('|', $m[1]) as $opt) {
                $opt = trim($opt);
                if ($opt !== '' && mb_strlen($opt) <= 40) {
                    $options[] = $opt;
                }
            }
            $options = array_slice($options, 0, 6);
        }

        // أي أقواس متبقية في وسط النص تُحذف حتى لا تظهر للعميل
        $text = preg_replace('/\[\[[^\[\]]*\]\]/u', '', $text);

        return ['text' => trim($text), 'quick_replies' => $options];
    }
}
