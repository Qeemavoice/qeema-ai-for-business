<?php

namespace App\QeemaChat;

use App\QeemaChat\Console\ImportTalentsCommand;
use App\QeemaChat\Http\ChatController;
use App\QeemaChat\Http\CorsMiddleware;
use App\QeemaChat\Llm\AnthropicProvider;
use App\QeemaChat\Llm\LlmProvider;
use App\QeemaChat\Llm\OpenAiProvider;
use App\QeemaChat\Voice\ElevenLabsClient;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class QeemaChatServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(LlmProvider::class, function () {
            $cfg = config('qeema_chat');
            $transport = function (string $url, array $headers, array $body): array {
                $res = Http::withHeaders($headers)->timeout(60)->post($url, $body);

                return ['status' => $res->status(), 'json' => $res->json()];
            };

            if ($cfg['provider'] === 'openai') {
                return new OpenAiProvider((string) $cfg['openai']['api_key'], $cfg['openai']['model'], $transport, $cfg['openai']['max_tokens']);
            }

            return new AnthropicProvider((string) $cfg['anthropic']['api_key'], $cfg['anthropic']['model'], $transport, $cfg['anthropic']['max_tokens']);
        });

        $this->app->bind(ElevenLabsClient::class, function () {
            $cfg = config('qeema_chat.elevenlabs');

            return new ElevenLabsClient((string) $cfg['api_key'], $cfg['preview_model'], $cfg['output_format'], $cfg['watermark_path']);
        });
    }

    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([ImportTalentsCommand::class]);
        }

        Route::middleware(['api', CorsMiddleware::class])
            ->prefix('qv-chat')
            ->group(function () {
                Route::post('message', [ChatController::class, 'message'])->middleware('throttle:20,1');
                Route::post('lead/start', [ChatController::class, 'leadStart'])->middleware('throttle:5,10');
                Route::post('lead/verify', [ChatController::class, 'leadVerify'])->middleware('throttle:10,10');
                Route::options('{any}', fn () => response('', 204))->where('any', '.*');
            });

        Route::get('qv-chat/preview/{id}', [ChatController::class, 'preview'])
            ->middleware('signed')
            ->name('qv-chat.preview');
    }
}
