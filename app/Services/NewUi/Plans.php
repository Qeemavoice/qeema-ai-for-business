<?php

namespace App\Services\NewUi;

/** Subscription plans and human-voice pricing rules of the new UI (port of new-ui/shared/plans.ts and pricing.ts). */
class Plans
{
    public const SIGNUP_BONUS_CREDITS = 5000;
    public const DEFAULT_PLAN_ID = 'plan-free';
    /** Platform commission added on top of the narrator price (new UI rule). */
    public const PLATFORM_COMMISSION_PERCENT = 30;

    public static function all(): array
    {
        return [
            [
                'id' => 'plan-free', 'name' => 'Free', 'nameAr' => 'مجاني',
                'tagline' => 'ابدأ وجرّب الأصوات واستوديو التوليد بدون أي تكلفة.',
                'monthlyCredits' => 0, 'priceUsd' => 0, 'annualPriceUsd' => 0, 'bookingDiscountPct' => 0,
                'badge' => 'رصيد مجاني عند التسجيل',
                'features' => [
                    ['icon' => 'gift', 'text' => '5,000 حرف رصيد ترحيبي مجاني'],
                    ['icon' => 'audio', 'text' => 'تحويل النص إلى صوت بأصوات AI'],
                    ['icon' => 'headphones', 'text' => 'الاستماع لعينات المعلقين البشريين'],
                    ['icon' => 'calendar', 'text' => 'حجز معلق بشري لأي مشروع'],
                    ['icon' => 'file', 'text' => 'تنزيل بصيغة MP3'],
                ],
            ],
            [
                'id' => 'plan-starter', 'name' => 'Starter', 'nameAr' => 'مبتدئ',
                'tagline' => 'لمن يبدأ إنتاج محتواه الصوتي بانتظام.',
                'monthlyCredits' => 25000, 'priceUsd' => 20, 'annualPriceUsd' => 16, 'bookingDiscountPct' => 0,
                'inheritsFrom' => 'المجانية',
                'features' => [
                    ['icon' => 'audio', 'text' => '25,000 حرف شهرياً'],
                    ['icon' => 'calendar', 'text' => 'حجز معلق بشري لأي مشروع'],
                    ['icon' => 'mic', 'text' => 'أستوديو TTS لتحويل النص إلى صوت'],
                    ['icon' => 'shield', 'text' => 'ترخيص تجاري كامل للمحتوى'],
                    ['icon' => 'file', 'text' => 'تنزيل WAV 48kHz بجودة استوديو'],
                    ['icon' => 'history', 'text' => 'سجل توليد غير محدود'],
                ],
            ],
            [
                'id' => 'plan-creator', 'name' => 'Content Creator', 'nameAr' => 'صانع محتوى',
                'tagline' => 'لصناع المحتوى والمسوّقين والوكالات الصغيرة.',
                'monthlyCredits' => 50000, 'priceUsd' => 30, 'annualPriceUsd' => 24, 'bookingDiscountPct' => 15,
                'badge' => 'الأكثر طلباً', 'featured' => true, 'inheritsFrom' => 'مبتدئ',
                'features' => [
                    ['icon' => 'audio', 'text' => '50,000 حرف شهرياً'],
                    ['icon' => 'percent', 'text' => 'خصم 15% على حجوزات المعلقين'],
                    ['icon' => 'zap', 'text' => 'أولوية في التوليد والمعالجة'],
                    ['icon' => 'sparkles', 'text' => 'الوصول المبكر للميزات الجديدة'],
                    ['icon' => 'headphones', 'text' => 'دعم مخصص من فريق الهندسة الصوتية'],
                ],
            ],
            [
                'id' => 'plan-enterprise', 'name' => 'Business', 'nameAr' => 'الشركات',
                'tagline' => 'للشركات والمؤسسات والإنتاج الضخم.',
                'monthlyCredits' => 0, 'priceUsd' => null, 'annualPriceUsd' => null, 'bookingDiscountPct' => 0,
                'inheritsFrom' => 'صانع محتوى', 'isCustom' => true,
                'features' => [
                    ['icon' => 'audio', 'text' => 'رصيد حروف حسب احتياج منشأتك'],
                    ['icon' => 'mic', 'text' => 'صوت AI حصري لعلامتك التجارية'],
                    ['icon' => 'percent', 'text' => 'خصم مخصص على حجوزات المعلقين'],
                    ['icon' => 'building', 'text' => 'حسابات فريق متعددة وفواتير نظامية'],
                    ['icon' => 'clock', 'text' => 'مدير حساب واتفاقية مستوى خدمة SLA'],
                ],
            ],
        ];
    }

    public static function find(?string $id): ?array
    {
        foreach (self::all() as $p) if ($p['id'] === $id) return $p;
        return null;
    }

    /** USD value of one credit on a plan (plan price ÷ monthly credits); 0 on free / custom plans. */
    public static function creditPriceUsd(?string $planId): float
    {
        $p = self::find($planId);
        if (!$p || !$p['priceUsd'] || !$p['monthlyCredits']) return 0.0;
        return $p['priceUsd'] / $p['monthlyCredits'];
    }

    public static function commissionPercent(): float
    {
        return (float) (Store::settings()['platformCommissionPercent'] ?? self::PLATFORM_COMMISSION_PERCENT);
    }

    /** Final price shown to the client (narrator price + commission). */
    public static function finalPrice(float $narratorPrice, ?float $pct = null): float
    {
        $pct = $pct ?? self::commissionPercent();
        return round($narratorPrice * (1 + $pct / 100), 2);
    }

    /** Narrator share contained inside a final (client-facing) price. */
    public static function narratorShareOf(float $finalPrice, ?float $pct = null): float
    {
        $pct = $pct ?? self::commissionPercent();
        return round($finalPrice / (1 + $pct / 100), 2);
    }
}
