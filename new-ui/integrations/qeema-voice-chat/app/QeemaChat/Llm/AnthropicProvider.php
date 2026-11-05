<?php

namespace App\QeemaChat\Llm;

/**
 * مزود Claude عبر Anthropic Messages API.
 * $transport: fn(string $url, array $headers, array $body): array{status: int, json: ?array}
 */
class AnthropicProvider implements LlmProvider
{
    private const URL = 'https://api.anthropic.com/v1/messages';

    /** @var callable */
    private $transport;

    public function __construct(
        private string $apiKey,
        private string $model,
        callable $transport,
        private int $maxTokens = 1024,
    ) {
        $this->transport = $transport;
    }

    public function complete(array $system, array $history, array $tools): LlmResponse
    {
        $body = [
            'model' => $this->model,
            'max_tokens' => $this->maxTokens,
            'system' => [
                // الجزء الثابت يُخزّن مؤقتًا: يقلل التكلفة والزمن في كل رسالة
                ['type' => 'text', 'text' => $system[0], 'cache_control' => ['type' => 'ephemeral']],
                ['type' => 'text', 'text' => $system[1]],
            ],
            'messages' => $this->toMessages($history),
            'tools' => array_map(fn ($t) => [
                'name' => $t['name'],
                'description' => $t['description'],
                'input_schema' => $t['parameters'],
            ], $tools),
        ];

        $res = ($this->transport)(self::URL, [
            'x-api-key' => $this->apiKey,
            'anthropic-version' => '2023-06-01',
            'content-type' => 'application/json',
        ], $body);

        if (($res['status'] ?? 0) >= 400 || !is_array($res['json'] ?? null)) {
            $msg = $res['json']['error']['message'] ?? 'unknown error';
            throw new LlmException("Anthropic API error ({$res['status']}): {$msg}");
        }

        $text = '';
        $calls = [];
        foreach ($res['json']['content'] ?? [] as $block) {
            if (($block['type'] ?? '') === 'text') {
                $text .= $block['text'];
            } elseif (($block['type'] ?? '') === 'tool_use') {
                $calls[] = ['id' => $block['id'], 'name' => $block['name'], 'input' => (array) ($block['input'] ?? [])];
            }
        }

        return new LlmResponse(trim($text), $calls, (array) ($res['json']['usage'] ?? []));
    }

    private function toMessages(array $history): array
    {
        $messages = [];
        foreach ($history as $h) {
            switch ($h['role']) {
                case 'user':
                    $messages[] = ['role' => 'user', 'content' => [['type' => 'text', 'text' => $h['text']]]];
                    break;

                case 'assistant':
                    $content = [];
                    if (($h['text'] ?? '') !== '') {
                        $content[] = ['type' => 'text', 'text' => $h['text']];
                    }
                    foreach ($h['tool_calls'] ?? [] as $c) {
                        $content[] = [
                            'type' => 'tool_use',
                            'id' => $c['id'],
                            'name' => $c['name'],
                            'input' => (object) $c['input'],
                        ];
                    }
                    if ($content) {
                        $messages[] = ['role' => 'assistant', 'content' => $content];
                    }
                    break;

                case 'tool':
                    $messages[] = ['role' => 'user', 'content' => array_map(fn ($r) => [
                        'type' => 'tool_result',
                        'tool_use_id' => $r['id'],
                        'content' => $r['content'],
                    ], $h['results'])];
                    break;
            }
        }

        return $this->mergeConsecutive($messages);
    }

    /** Anthropic يشترط تناوب الأدوار؛ ندمج الرسائل المتتالية من نفس الدور */
    private function mergeConsecutive(array $messages): array
    {
        $out = [];
        foreach ($messages as $m) {
            $last = count($out) - 1;
            if ($last >= 0 && $out[$last]['role'] === $m['role']) {
                $out[$last]['content'] = array_merge($out[$last]['content'], $m['content']);
            } else {
                $out[] = $m;
            }
        }

        return $out;
    }
}
