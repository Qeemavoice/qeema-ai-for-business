<?php

namespace App\Console\Commands;

use App\Models\SuccessStory;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ImportTestSuccessStories extends Command
{
    protected $signature = 'stories:import-test {--dry-run : Show the import count without writing} {--skip-media : Do not copy audio files}';
    protected $description = 'Import published success stories and audio samples from test.qeemavoice.com';

    public function handle(): int
    {
        $source = 'https://test.qeemavoice.com';
        $response = Http::timeout(45)->acceptJson()->get($source . '/api/v1/stories');

        if (!$response->successful() || !is_array($response->json('items'))) {
            $this->error('Could not load stories from test.qeemavoice.com.');
            return self::FAILURE;
        }

        $items = $response->json('items');
        $this->info('Found ' . count($items) . ' stories.');

        if ($this->option('dry-run')) {
            return self::SUCCESS;
        }

        foreach ($items as $index => $item) {
            $slug = Str::slug((string) ($item['id'] ?? ''));
            if ($slug === '') {
                $this->warn('Skipped story without an id.');
                continue;
            }

            $audioUrl = $this->copyMedia($item['audioUrl'] ?? null, $source, $slug);
            $clips = collect($item['clips'] ?? [])->map(function ($clip, $clipIndex) use ($source, $slug) {
                return [
                    'title' => (string) ($clip['title'] ?? 'عينة صوتية'),
                    'url' => $this->copyMedia($clip['url'] ?? null, $source, $slug . '-' . $clipIndex),
                ];
            })->filter(fn ($clip) => filled($clip['url']))->values()->all();

            $existing = SuccessStory::withTrashed()->where('slug', $slug)->first();
            $story = $existing ?: new SuccessStory(['slug' => $slug]);

            $story->fill([
                'brand' => (string) ($item['brand'] ?? $slug),
                'brand_en' => $item['brandEn'] ?? null,
                'brand_color' => $item['brandColor'] ?? null,
                'about' => $item['about'] ?? null,
                'voice_category' => $item['voiceCategory'] ?? null,
                'industry' => $item['industry'] ?? null,
                'title' => (string) ($item['title'] ?? $item['brand'] ?? $slug),
                'title_en' => $item['titleEn'] ?? null,
                'story_date' => $item['date'] ?? null,
                'audio_url' => $audioUrl,
                'audio_duration' => $item['audioDuration'] ?? null,
                'audio_duration_secs' => $item['audioDurationSecs'] ?? null,
                'hero_subtitle' => $item['heroSubtitle'] ?? null,
                'stats' => $item['stats'] ?? [],
                'paragraphs' => $item['paragraphs'] ?? [],
                'highlights' => $item['highlights'] ?? [],
                'clips' => $clips,
                'content' => $item['content'] ?? null,
                'quote_text' => data_get($item, 'quote.text') ?: ($item['quoteText'] ?? null),
                'quote_author' => data_get($item, 'quote.author') ?: ($item['quoteAuthor'] ?? null),
                'quote_role' => data_get($item, 'quote.role') ?: ($item['quoteRole'] ?? null),
                'image_accent' => $item['imageAccent'] ?? null,
                'source_url' => $source . '/ar/our-works/' . $slug,
                'imported_at' => now(),
            ]);

            if (!$existing) {
                $story->is_published = ($item['status'] ?? 'published') === 'published';
                $story->permission_confirmed = true;
                $story->sort_order = $index + 1;
            }

            if ($story->trashed()) $story->restore();
            $story->save();
        }

        $this->info('Success stories imported.');
        return self::SUCCESS;
    }

    private function copyMedia($path, string $source, string $name): ?string
    {
        if (!$path) return null;
        $remote = Str::startsWith($path, ['http://', 'https://']) ? $path : $source . '/' . ltrim($path, '/');
        if ($this->option('skip-media')) return $remote;

        try {
            $response = Http::timeout(90)->get($remote);
            if (!$response->successful() || $response->body() === '') return $remote;

            $extension = pathinfo(parse_url($remote, PHP_URL_PATH) ?: '', PATHINFO_EXTENSION) ?: 'mp3';
            $filename = Str::slug($name) . '.' . strtolower($extension);
            $directory = public_path('uploads/success-stories');
            File::ensureDirectoryExists($directory);
            File::put($directory . '/' . $filename, $response->body());

            return '/uploads/success-stories/' . $filename;
        } catch (\Throwable $exception) {
            $this->warn('Could not copy media: ' . $remote);
            return $remote;
        }
    }
}
