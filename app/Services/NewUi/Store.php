<?php

namespace App\Services\NewUi;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * JSON store of the new UI on MySQL: key/value rows (qv_kv), dashboard collections (qv_collections)
 * and the admin audit trail (qv_audit_logs). Replaces new-ui/server/db/store.ts + collections.ts.
 */
class Store
{
    // ---------- key / value ----------
    public static function get(string $key, $default = null)
    {
        $v = DB::table('qv_kv')->where('key', $key)->value('value');
        if ($v === null) return $default;
        $decoded = json_decode($v, true);
        return $decoded === null && $v !== 'null' ? $default : $decoded;
    }

    public static function set(string $key, $value): void
    {
        $now = now();
        DB::table('qv_kv')->updateOrInsert(
            ['key' => $key],
            ['value' => json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), 'updated_at' => $now, 'created_at' => $now]
        );
    }

    // ---------- system settings ----------
    public static function settingsDefaults(): array
    {
        return [
            'platformCommissionPercent' => Plans::PLATFORM_COMMISSION_PERCENT,
            'elevenLabsStatus' => 'operational',
            'geminiAiStatus' => 'operational',
            'cdnStorageStatus' => 'operational',
            'maintenanceMode' => false,
            'creditRatePer10kCharsUsd' => 4.0,
            'paymentEscrowModel' => 'direct_100_percent',
            'defaultCurrency' => 'USD',
            'stripeFeePercent' => 5,
        ];
    }

    public static function settings(): array
    {
        return array_merge(self::settingsDefaults(), self::get('systemSettings', []) ?: []);
    }

    public static function saveSettings(array $s): void
    {
        self::set('systemSettings', array_merge(self::settings(), $s));
    }

    public static function integrationsDefaults(): array
    {
        return [
            'stripe' => ['enabled' => false, 'displayName' => 'Stripe', 'testMode' => true,
                'livePublishableKey' => '', 'liveSecretKey' => '', 'testPublishableKey' => '', 'testSecretKey' => ''],
            'smtp' => ['driver' => 'smtp', 'fromName' => 'Qeema Voice', 'fromAddress' => '', 'host' => '', 'port' => 465,
                'username' => '', 'password' => '', 'encryption' => 'SSL'],
            'elevenlabs' => ['apiKey' => '', 'agentId' => ''],
            'munsit' => ['apiKey' => ''],
            'google' => ['clientId' => ''],   // public OAuth client id (not a secret) for «تسجيل الدخول عبر Google»
        ];
    }

    /** Keys and passwords: stored encrypted with the app key (APP_KEY), never shown back in full */
    public const SECRET_FIELDS = ['stripe' => ['liveSecretKey', 'testSecretKey'], 'smtp' => ['password'], 'elevenlabs' => ['apiKey'], 'munsit' => ['apiKey']];
    private const ENC = 'enc:';

    public static function integrations(): array
    {
        $saved = self::get('integrations', []) ?: [];
        $out = self::integrationsDefaults();
        foreach ($out as $g => $vals) $out[$g] = array_merge($vals, $saved[$g] ?? []);
        foreach (self::SECRET_FIELDS as $g => $fields) {
            foreach ($fields as $f) {
                $v = (string) ($out[$g][$f] ?? '');
                if (strpos($v, self::ENC) !== 0) continue;   // older plain value: encrypted on the next save
                try {
                    $out[$g][$f] = \Illuminate\Support\Facades\Crypt::decryptString(substr($v, strlen(self::ENC)));
                } catch (\Throwable $e) {
                    report($e);   // APP_KEY changed: the key has to be entered again
                    $out[$g][$f] = '';
                }
            }
        }
        return $out;
    }

    /** One provider key from the admin dashboard; '' when unset or the store is unreachable (the env key is then used) */
    public static function integrationKey(string $group): string
    {
        try {
            return trim((string) (self::integrations()[$group]['apiKey'] ?? ''));
        } catch (\Throwable $e) {
            return '';
        }
    }

    /** Google OAuth client id: the admin dashboard first, then GOOGLE_CLIENT_ID */
    public static function googleClientId(): string
    {
        try {
            $id = trim((string) (self::integrations()['google']['clientId'] ?? ''));
        } catch (\Throwable $e) {
            $id = '';
        }
        return $id !== '' ? $id : trim((string) config('services.google.client_id', ''));
    }

    public static function saveIntegrations(array $i): void
    {
        foreach (self::SECRET_FIELDS as $g => $fields) {
            foreach ($fields as $f) {
                $v = (string) ($i[$g][$f] ?? '');
                if ($v !== '' && strpos($v, self::ENC) !== 0) $i[$g][$f] = self::ENC . \Illuminate\Support\Facades\Crypt::encryptString($v);
            }
        }
        self::set('integrations', $i);
    }

    // ---------- collections ----------
    public static function list(string $name): array
    {
        return DB::table('qv_collections')->where('name', $name)->orderByDesc('created_at')->get()
            ->map(fn ($r) => self::row($r))->all();
    }

    public static function find(string $name, string $id): ?array
    {
        $r = DB::table('qv_collections')->where('name', $name)->where('id', $id)->first();
        return $r ? self::row($r) : null;
    }

    public static function create(string $name, array $data): array
    {
        $id = $data['id'] ?? null;
        if (!$id || DB::table('qv_collections')->where('id', $id)->exists()) {
            $max = DB::table('qv_collections')->where('name', $name)->where('id', 'like', $name . '-%')->pluck('id')
                ->map(fn ($x) => (int) substr($x, strlen($name) + 1))->max();
            $id = $name . '-' . max(1001, ((int) $max) + 1);
        }
        unset($data['id']);
        $now = now();
        DB::table('qv_collections')->insert([
            'id' => $id, 'name' => $name,
            'data' => json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'created_at' => $now, 'updated_at' => $now,
        ]);
        return array_merge(['id' => $id], $data);
    }

    public static function update(string $name, string $id, array $patch): ?array
    {
        $cur = self::find($name, $id);
        if (!$cur) return null;
        unset($patch['id']);
        $data = array_merge($cur, $patch);
        unset($data['id']);
        DB::table('qv_collections')->where('id', $id)->update([
            'data' => json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), 'updated_at' => now(),
        ]);
        return array_merge(['id' => $id], $data);
    }

    public static function remove(string $name, string $id): bool
    {
        return DB::table('qv_collections')->where('name', $name)->where('id', $id)->delete() > 0;
    }

    private static function row($r): array
    {
        $data = json_decode($r->data, true) ?: [];
        return array_merge(['id' => $r->id], $data);
    }

    // ---------- audit ----------
    public static function audit(string $companyId, string $actor, string $action, $metadata = null): void
    {
        DB::table('qv_audit_logs')->insert([
            'id' => 'log-' . Str::uuid(), 'company_id' => $companyId, 'actor' => $actor, 'action' => mb_substr($action, 0, 255),
            'metadata' => $metadata === null ? null : json_encode($metadata, JSON_UNESCAPED_UNICODE),
            'created_at' => now(),
        ]);
    }

    public static function auditLogs(int $limit = 30, ?string $companyId = null): array
    {
        $q = DB::table('qv_audit_logs')->orderByDesc('created_at')->limit($limit);
        if ($companyId) $q->where('company_id', $companyId);
        return $q->get()->map(fn ($r) => [
            'id' => $r->id, 'companyId' => $r->company_id, 'actor' => $r->actor, 'action' => $r->action,
            'metadata' => $r->metadata ? json_decode($r->metadata, true) : null, 'createdAt' => self::iso($r->created_at),
        ])->all();
    }

    /** Raw date column of a model or a DB row (old models format created_at as a string via HasTimestamps) */
    public static function created($row, string $field = 'created_at')
    {
        if (!$row) return null;
        if ($row instanceof \Illuminate\Database\Eloquent\Model) return $row->getAttributes()[$field] ?? null;
        return is_object($row) ? ($row->{$field} ?? null) : (is_array($row) ? ($row[$field] ?? null) : $row);
    }

    public static function carbon($dt): ?\Carbon\Carbon
    {
        if (!$dt) return null;
        if ($dt instanceof \DateTimeInterface) return \Carbon\Carbon::instance($dt);
        try { return \Carbon\Carbon::parse((string) $dt); } catch (\Throwable $e) {}
        try { return \Carbon\Carbon::createFromFormat(defined('CREATED_AT_FORMAT') ? CREATED_AT_FORMAT : 'd M Y, h:i a', (string) $dt); } catch (\Throwable $e) { return null; }
    }

    /** ISO-8601 like the Node server produced ("2026-11-05T10:00:00.000Z") */
    public static function iso($dt): string
    {
        $c = self::carbon($dt);
        return $c ? $c->utc()->format('Y-m-d\TH:i:s.v\Z') : '';
    }

    /** "2026-11-05" */
    public static function day($dt): string
    {
        $c = self::carbon($dt);
        return $c ? $c->format('Y-m-d') : '';
    }
}
