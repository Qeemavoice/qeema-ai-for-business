<?php

namespace App\Console\Commands;

use App\Models\Invite;
use App\Models\User;
use App\Services\NewUi\Accounts;
use App\Services\RowadService;
use Illuminate\Console\Command;

/**
 * php artisan rowad:generate-invites storage/app/rowad_clients.csv [--force]
 * In: CSV client_id,name,email,phone (client_id or email is enough).
 * Out: storage/app/rowad_invites_export.csv name,email,phone,code,email_link,whatsapp_link
 */
class RowadGenerateInvites extends Command
{
    protected $signature = 'rowad:generate-invites {csv : CSV with client_id,name,email,phone} {--force : new invite even when the client already has a valid one}';
    protected $description = '«روّاد قيمة»: creates the invites and writes storage/app/rowad_invites_export.csv';

    public function handle()
    {
        $path = $this->argument('csv');
        if (!is_file($path) && is_file(base_path($path))) $path = base_path($path);
        if (!is_file($path)) { $this->error("الملف غير موجود: {$path}"); return 1; }

        $fh = fopen($path, 'r');
        $head = array_map(fn ($h) => strtolower(trim(preg_replace('/^\xEF\xBB\xBF/', '', $h))), fgetcsv($fh) ?: []);
        foreach (['client_id', 'name', 'email', 'phone'] as $col) {
            if (!in_array($col, $head, true)) { $this->error("عمود ناقص في الملف: {$col}"); return 1; }
        }

        $expires = RowadService::at('invite_expires_at');
        $out = [];
        $created = 0; $kept = 0; $skipped = 0;
        while (($row = fgetcsv($fh)) !== false) {
            if (!array_filter($row)) continue;
            $r = array_combine($head, array_pad(array_slice($row, 0, count($head)), count($head), ''));
            $clientId = (int) trim((string) $r['client_id']) ?: null;
            $email = mb_strtolower(trim((string) $r['email'])) ?: null;
            if (!$clientId && !$email) { $skipped++; $this->warn('سطر بدون client_id ولا email: تم تجاهله'); continue; }

            $user = $clientId ? User::find($clientId) : Accounts::findByEmail($email);
            if ($user) { $clientId = $user->id; $email = $email ?: mb_strtolower((string) $user->email); }
            $name = trim((string) $r['name']) ?: ($user ? Accounts::name($user) : '');
            $phone = trim((string) $r['phone']) ?: (string) ($user->mobile ?? '');

            $existing = Invite::query()
                ->where(fn ($q) => $clientId ? $q->where('client_id', $clientId)->orWhere('email', $email) : $q->where('email', $email))
                ->whereNotIn('status', [Invite::REDEEMED, Invite::EXPIRED])->where('expires_at', '>', now())->latest('id')->first();
            if ($existing && !$this->option('force')) {
                $invite = $existing; $kept++;
            } else {
                do { $code = RowadService::code(); } while (Invite::where('code', $code)->exists());
                $invite = Invite::create(['code' => $code, 'client_id' => $clientId, 'email' => $email, 'name' => $name ?: null,
                    'phone' => $phone ?: null, 'campaign' => config('rowad.campaign'), 'status' => Invite::CREATED, 'expires_at' => $expires]);
                $created++;
            }
            $out[] = [$name, $email, $phone, $invite->code, RowadService::link($invite->code, 'email'), RowadService::link($invite->code, 'whatsapp')];
        }
        fclose($fh);

        $file = storage_path('app/rowad_invites_export.csv');
        $w = fopen($file, 'w');
        fwrite($w, "\xEF\xBB\xBF");   // BOM: Excel opens the Arabic names correctly
        fputcsv($w, ['name', 'email', 'phone', 'code', 'email_link', 'whatsapp_link']);
        foreach ($out as $line) fputcsv($w, $line);
        fclose($w);
        @chmod($file, 0640);

        // the codes are written to the export file only, never to the console or the logs
        $this->info("دعوات جديدة: {$created} | دعوات صالحة موجودة مسبقاً: {$kept} | أسطر متجاهلة: {$skipped}");
        $this->info("الملف: {$file}");
        return 0;
    }
}
