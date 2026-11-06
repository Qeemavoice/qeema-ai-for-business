<?php

namespace App\Http\Controllers\AdminPanel\Setting;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\ElevenLabsTts;
use App\Services\MunsitTts;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TtsProviderController extends Controller
{
    private const SETTINGS_KEY = 'new-ui-tts-providers';

    public function index(ElevenLabsTts $elevenLabs, MunsitTts $munsit)
    {
        $settings = $this->settings($elevenLabs, $munsit);
        meta_data('مزوّدو تحويل النص إلى صوت', 'مزوّدو تحويل النص إلى صوت', [
            '#' => trans_admin('settings'),
            '' => 'مزوّدو تحويل النص إلى صوت',
        ]);

        return view('admin_panel.settings.tts-providers.index', compact('settings'));
    }

    public function update(Request $request, ElevenLabsTts $elevenLabs, MunsitTts $munsit)
    {
        $data = $request->validate([
            'enabled' => ['required', 'array', 'min:1'],
            'enabled.*' => ['required', 'in:elevenlabs,munsit'],
            'active' => ['required', 'in:elevenlabs,munsit'],
        ]);
        abort_unless(in_array($data['active'], $data['enabled'], true), 422, 'المزوّد الافتراضي يجب أن يكون مفعّلاً.');

        $configured = [
            'elevenlabs' => $elevenLabs->isConfigured(),
            'munsit' => $munsit->isConfigured(),
        ];
        foreach ($data['enabled'] as $provider) {
            abort_unless($configured[$provider], 422, 'أضف مفتاح المزوّد في ملف البيئة على الخادم أولاً.');
        }

        Setting::query()->updateOrCreate(
            ['key' => self::SETTINGS_KEY],
            ['value' => json_encode(['enabled' => array_values(array_unique($data['enabled'])), 'active' => $data['active']])]
        );
        Cache::forget('settings');

        return redirect()->to(route_admin('setting.tts-providers.index'))->with('success', 'تم حفظ إعدادات مزوّدي الصوت.');
    }

    private function settings(ElevenLabsTts $elevenLabs, MunsitTts $munsit): array
    {
        $stored = Setting::query()->where('key', self::SETTINGS_KEY)->value('value');
        $saved = is_string($stored) ? json_decode($stored, true) : null;
        $configured = [
            'elevenlabs' => $elevenLabs->isConfigured(),
            'munsit' => $munsit->isConfigured(),
        ];
        $defaultProvider = (string) config('services.tts.default_provider', 'munsit');
        $enabled = is_array($saved['enabled'] ?? null)
            ? array_values(array_intersect($saved['enabled'], ['elevenlabs', 'munsit']))
            : (isset($configured[$defaultProvider]) && $configured[$defaultProvider] ? [$defaultProvider] : []);
        $enabled = array_values(array_filter($enabled, fn ($provider) => $configured[$provider] ?? false));
        $active = (string) ($saved['active'] ?? $defaultProvider);
        if (!($configured[$active] ?? false)) $active = array_key_first(array_filter($configured)) ?: '';

        return [
            'enabled' => $enabled,
            'active' => $active,
            'providers' => [
                'elevenlabs' => ['label' => 'ElevenLabs', 'configured' => $configured['elevenlabs']],
                'munsit' => ['label' => 'منصّت', 'configured' => $configured['munsit']],
            ],
        ];
    }
}
