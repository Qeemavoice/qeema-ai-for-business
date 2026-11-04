<?php

namespace App\QeemaChat\Llm;

/**
 * واجهة موحدة لمزود النموذج اللغوي.
 *
 * السجل (history) بصيغة محايدة:
 *  ['role' => 'user', 'text' => '...']
 *  ['role' => 'assistant', 'text' => '...', 'tool_calls' => [['id' => .., 'name' => .., 'input' => [..]]]]
 *  ['role' => 'tool', 'results' => [['id' => .., 'name' => .., 'content' => 'json']]]
 */
interface LlmProvider
{
    /**
     * @param array{0: string, 1: string} $system [الجزء الثابت، الجزء المتغير]
     */
    public function complete(array $system, array $history, array $tools): LlmResponse;
}
