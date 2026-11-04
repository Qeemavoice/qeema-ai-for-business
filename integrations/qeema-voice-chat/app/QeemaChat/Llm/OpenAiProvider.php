<?php

namespace App\QeemaChat\Llm;

/**
 * مزود ChatGPT عبر OpenAI Chat Completions API (بديل لمزود Claude).
 * $transport: fn(string $url, array $headers, array $body): array{status: int, json: ?array}
 */
class OpenAiProvider implements LlmProvider
{
    private const URL = 'https://api.openai.com/v1/chat/completions';

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
        $messages = [['role' => 'system', 'content' => $system[0] . "\n\n" . $system[1]]];

        foreach ($history as $h) {
            switch ($h['role']) {
                case 'user':
                    $messages[] = ['role' => 'user', 'content' => $h['text']];
                    break;

                case 'assistant':
                    $m = ['role' => 'assistant', 'content' => ($h['text'] ?? '') !== '' ? $h['text'] : null];
                    if (!empty($h['tool_calls'])) {
                        $m['tool_calls'] = array_map(fn ($c) => [
                            'id' => $c['id'],
                            'type' => 'function',
                            'function' => [
                                'name' => $c['name'],
                                'arguments' => json_encode((object) $c['input'], JSON_UNESCAPED_UNICODE),
                            ],
                        ], $h['tool_calls']);
                    }
                    $messages[] = $m;
                    break;

                case 'tool':
                    foreach ($h['results'] as $r) {
                        $messages[] = ['role' => 'tool', 'tool_call_id' => $r['id'], 'content' => $r['content']];
                    }
                    break;
            }
        }

        $body = [
            'model' => $this->model,
            'max_completion_tokens' => $this->maxTokens,
            'messages' => $messages,
            'tools' => array_map(fn ($t) => [
                'type' => 'function',
                'function' => [
                    'name' => $t['name'],
                    'description' => $t['description'],
                    'parameters' => $t['parameters'],
                ],
            ], $tools),
        ];

        $res = ($this->transport)(self::URL, [
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json',
        ], $body);

        if (($res['status'] ?? 0) >= 400 || !is_array($res['json'] ?? null)) {
            $msg = $res['json']['error']['message'] ?? 'unknown error';
            throw new LlmException("OpenAI API error ({$res['status']}): {$msg}");
        }

        $choice = $res['json']['choices'][0]['message'] ?? [];
        $calls = [];
        foreach ($choice['tool_calls'] ?? [] as $c) {
            $args = json_decode($c['function']['arguments'] ?? '{}', true);
            $calls[] = ['id' => $c['id'], 'name' => $c['function']['name'], 'input' => is_array($args) ? $args : []];
        }

        return new LlmResponse(trim((string) ($choice['content'] ?? '')), $calls, (array) ($res['json']['usage'] ?? []));
    }
}
