<?php

namespace App\QeemaChat;

use App\QeemaChat\Llm\LlmProvider;
use App\QeemaChat\Support\ReplyParser;
use App\QeemaChat\Support\SystemPrompt;
use App\QeemaChat\Support\ToolDefinitions;
use App\QeemaChat\Tools\ToolExecutor;

/**
 * حلقة المحادثة: رسالة العميل ← النموذج ← (أدوات ← النموذج)* ← الرد.
 * لا تعتمد على Laravel، لذا يمكن اختبارها مستقلة.
 */
class ChatAgent
{
    private const MAX_TOOL_ROUNDS = 4;

    public function __construct(private LlmProvider $llm)
    {
    }

    /**
     * @return array{reply: string, quick_replies: array, ui: array, history: array, usage: array}
     */
    public function respond(array $history, string $userText, ToolExecutor $tools): array
    {
        $history[] = ['role' => 'user', 'text' => $userText];
        $ui = [];
        $usage = [];
        $finalText = '';

        for ($round = 0; $round <= self::MAX_TOOL_ROUNDS; $round++) {
            $system = SystemPrompt::build($tools->context());
            $response = $this->llm->complete($system, $history, ToolDefinitions::all());
            $usage[] = $response->usage;

            $history[] = [
                'role' => 'assistant',
                'text' => $response->text,
                'tool_calls' => $response->toolCalls,
            ];

            if (!$response->wantsTools()) {
                $finalText = $response->text;
                break;
            }

            // بعض النماذج تكتب نصًا قبل استدعاء الأداة؛ نحتفظ به للعرض
            if ($response->text !== '') {
                $finalText = $response->text;
            }

            $results = [];
            foreach ($response->toolCalls as $call) {
                try {
                    $out = $tools->execute($call['name'], $call['input']);
                } catch (\Throwable $e) {
                    self::report($e);
                    $out = ['result' => ['status' => 'error', 'message' => 'تعذر تنفيذ الأداة الآن'], 'ui' => []];
                }
                $ui = array_merge($ui, $out['ui']);
                $results[] = [
                    'id' => $call['id'],
                    'name' => $call['name'],
                    'content' => json_encode($out['result'], JSON_UNESCAPED_UNICODE),
                ];
            }
            $history[] = ['role' => 'tool', 'results' => $results];

            if ($round === self::MAX_TOOL_ROUNDS) {
                $finalText = 'عذرًا، استغرق طلبك وقتًا أطول من المتوقع. هل يمكنك إعادة صياغته باختصار؟';
            }
        }

        $parsed = ReplyParser::parse($finalText);

        return [
            'reply' => $parsed['text'],
            'quick_replies' => $parsed['quick_replies'],
            'ui' => $ui,
            'history' => $history,
            'usage' => $usage,
        ];
    }

    /**
     * يقصّ السجل الطويل لتقليل التكلفة، ويبدأ دائمًا من رسالة عميل
     * حتى لا تبقى نتيجة أداة بلا استدعائها.
     */
    public static function trimHistory(array $history, int $maxItems = 40): array
    {
        if (count($history) <= $maxItems) {
            return $history;
        }
        $slice = array_slice($history, -$maxItems);
        foreach ($slice as $i => $h) {
            if ($h['role'] === 'user') {
                return array_values(array_slice($slice, $i));
            }
        }

        return [];
    }

    private static function report(\Throwable $e): void
    {
        if (function_exists('report')) {
            report($e);
        } else {
            error_log($e->getMessage());
        }
    }
}
