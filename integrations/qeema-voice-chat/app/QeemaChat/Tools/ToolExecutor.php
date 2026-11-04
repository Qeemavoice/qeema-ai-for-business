<?php

namespace App\QeemaChat\Tools;

interface ToolExecutor
{
    /**
     * ينفذ الأداة ويرجع:
     *  - result: ما يُرسل للنموذج (مختصر)
     *  - ui: أحداث تُعرض للعميل في الواجهة (بطاقات، مشغل صوت، نموذج رقم...)
     *
     * @return array{result: array, ui: array}
     */
    public function execute(string $name, array $input): array;

    /** حالة المحادثة التي تُضاف لتعليمات النظام (رصيد المعاينات، توثيق الرقم...) */
    public function context(): array;
}
