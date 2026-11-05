<?php

namespace App\QeemaChat\Llm;

class LlmResponse
{
    /**
     * @param array<int, array{id: string, name: string, input: array}> $toolCalls
     */
    public function __construct(
        public string $text,
        public array $toolCalls = [],
        public array $usage = [],
    ) {
    }

    public function wantsTools(): bool
    {
        return count($this->toolCalls) > 0;
    }
}
