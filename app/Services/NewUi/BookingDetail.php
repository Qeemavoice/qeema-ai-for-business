<?php

namespace App\Services\NewUi;

use App\Models\Order;
use App\Models\OrderStatus;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Everything about one voice booking for the admin's booking page (GET /api/v1/admin/bookings/{id}):
 * order, client (with history), narrator, sample, script, price lines, payments, cancellation requests,
 * the client ↔ narrator conversation with its files, and ratings. Works for old-site and new-UI bookings.
 */
class BookingDetail
{
    /** Translatable JSON column / value → Arabic text */
    private static function ar($v): string
    {
        if (is_array($v)) return (string) ($v['ar'] ?? ($v['en'] ?? reset($v) ?: ''));
        if (!is_string($v) || $v === '') return '';
        $d = json_decode($v, true);
        return is_array($d) ? self::ar($d) : $v;
    }

    private static function nameOf($table, $id): string
    {
        if (!$id) return '';
        $row = DB::table($table)->where('id', $id)->first(['name']);
        return $row ? self::ar($row->name) : '';
    }

    private static function person(?User $u, array $fallback = []): array
    {
        return [
            'id' => $u ? $u->id : null,
            'name' => $u ? (Accounts::name($u) ?: (string) ($fallback['name'] ?? '') ?: 'حساب #' . $u->id) : (string) ($fallback['name'] ?? ''),
            'email' => (string) ($u->email ?? ($fallback['email'] ?? '')),
            'phone' => (string) (($u && $u->mobile) ? $u->mobile : ($fallback['phone'] ?? '')),
            'hasAccount' => (bool) $u,
            'since' => $u ? Store::iso(Store::created($u, 'created_at')) : null,
        ];
    }

    public static function find(string $bookingId): ?array
    {
        $oid = Bookings::orderId($bookingId);
        $o = $oid ? Bookings::query()->whereKey($oid)->first() : null;
        if (!$o) return null;
        $meta = Bookings::meta($o->id);
        $view = Bookings::view($o, $meta, ($meta && $meta->sample_id) ? Library::find((string) $meta->sample_id) : null);
        $lp = json_decode((string) ($o->getAttributes()['list_of_price'] ?? ''), true) ?: [];

        // script: new-UI bookings keep it on the item, the old site in the price breakdown
        $script = trim((string) ($view['scriptText'] ?: ($lp['script']['scenario'] ?? '')));

        // sample (voice) of the booking
        $voiceItem = $o->items->firstWhere('itemable_type', 'App\\Models\\Voice');
        $sampleId = $view['sampleId'] ?: ($voiceItem ? (string) $voiceItem->itemable_id : null);
        $sample = $sampleId ? Library::find($sampleId) : null;
        if (!$sample && !empty($lp['script']['voice'])) {
            $v = $lp['script']['voice'];
            $sample = ['id' => (string) ($v['id'] ?? ''), 'sampleName' => self::ar($v['title'] ?? ''), 'dialect' => self::ar($v['dialect']['name'] ?? ''),
                'language' => self::ar($v['language']['name'] ?? ''), 'category' => '', 'previewUrl' => ''];
        }

        // price lines: the voice (script) and every extra service
        $lines = [];
        foreach ($o->items as $it) {
            $d = $it->details;
            $isVoice = $it->itemable_type === 'App\\Models\\Voice';
            $lines[] = [
                'label' => $isVoice ? 'السناريو' : (self::ar($it->item) ?: self::nameOf('services', $it->itemable_id) ?: 'خدمة إضافية'),
                'kind' => $isVoice ? 'voice' : 'service',
                'words' => $d ? (int) $d->word_count : null,
                'minutes' => $d ? (float) $d->number_of_minutes : null,
                'unitPrice' => (float) $it->unit_price,
                'percentage' => $it->percentage === null ? null : (float) $it->percentage,
                'total' => (float) $it->line_total,
            ];
        }

        // client with history (same e-mail grouping as «زبون متكرر»)
        $customer = $o->customer;
        $contact = $view['customerContact'] ?? [];
        $email = $view['customerEmail'];
        $history = ['bookings' => 0, 'spentUsd' => 0.0, 'first' => null, 'last' => null];
        if ($email !== '') {
            $hist = Bookings::query()->where(fn ($q) => $q->whereRaw('LOWER(customer_email) = ?', [$email])
                ->orWhereIn('customer_id', User::whereRaw('LOWER(email) = ?', [$email])->pluck('id')))
                ->whereNotIn('status_id', [OrderStatus::REJECTED, OrderStatus::CANCELED])->get(['id', 'total', 'created_at']);
            $history = ['bookings' => $hist->count(), 'spentUsd' => round((float) $hist->sum('total'), 2),
                'first' => Store::iso($hist->min('created_at')), 'last' => Store::iso($hist->max('created_at'))];
        }

        // payments
        $payments = DB::table('transactions')->where('order_id', $o->id)->whereNull('deleted_at')->orderBy('id')->get()->map(fn ($t) => [
            'id' => $t->id, 'reference' => (string) $t->transaction_id, 'status' => self::nameOf('transaction_statuses', $t->transaction_status_id),
            'type' => self::nameOf('transaction_types', $t->transaction_type_id), 'method' => class_basename((string) $t->methodable_type),
            'amountPaid' => (float) $t->amount_paid, 'received' => (float) $t->receiving_amount, 'fee' => (float) $t->transaction_fee,
            'description' => (string) $t->description, 'receipt' => (string) $t->receipt, 'createdAt' => Store::iso($t->created_at),
        ])->all();

        // cancellation requests
        $cancellations = DB::table('order_cancellation_requests')->where('order_id', $o->id)->orderBy('id')->get()->map(fn ($c) => [
            'id' => $c->id, 'reasons' => self::ar($c->reasons) ?: (string) $c->reasons, 'status' => self::nameOf('request_statuses', $c->request_status_id),
            'from' => ($u = User::withTrashed()->find($c->from_id)) ? Accounts::name($u) : '', 'createdAt' => Store::iso($c->created_at),
        ])->all();

        // client ↔ narrator conversation of this order, with files
        $messages = [];
        $threads = DB::table('user_messages')->where('order_id', $o->id)->pluck('id');
        if ($threads->isNotEmpty()) {
            $rows = DB::table('messages')->whereIn('user_message_id', $threads)->orderBy('created_at')->limit(500)->get();
            $files = DB::table('message_files')->whereIn('message_id', $rows->pluck('id'))->get()->groupBy('message_id');
            $names = User::withTrashed()->whereIn('id', $rows->pluck('u_from_id')->unique())->get()->keyBy('id');
            foreach ($rows as $m) {
                $from = $names[$m->u_from_id] ?? null;
                $messages[] = [
                    'id' => $m->id, 'text' => (string) $m->message, 'createdAt' => Store::iso($m->created_at), 'seen' => (bool) $m->seen,
                    'from' => $from ? Accounts::name($from) : '', 'side' => (int) $m->u_from_id === (int) $o->voice_actor_id ? 'narrator' : ((int) $m->u_from_id === (int) $o->customer_id ? 'client' : 'admin'),
                    'files' => ($files[$m->id] ?? collect())->map(fn ($f) => ['name' => (string) $f->file_name, 'url' => (string) $f->file_url, 'size' => (int) $f->size, 'type' => (string) $f->type])->values()->all(),
                ];
            }
        }

        // ratings
        $ratings = DB::table('user_ratings')->where('order_id', $o->id)->get()->map(fn ($r) => [
            'clientAverage' => $r->client_average === null ? null : (float) $r->client_average, 'clientResponse' => (string) $r->client_response,
            'narratorAverage' => $r->voice_actor_average === null ? null : (float) $r->voice_actor_average, 'narratorResponse' => (string) $r->voice_actor_response,
            'clientRatedAt' => Store::iso($r->client_rated_at), 'narratorRatedAt' => Store::iso($r->voice_actor_rated_at),
        ])->all();

        $total = (float) $o->total;
        $share = (float) $view['talentPayoutUsd'];
        return [
            'id' => $view['id'], 'number' => sprintf('ORD-%05d', $o->id), 'orderId' => $o->id,
            'status' => $view['status'], 'oldStatus' => self::nameOf('order_statuses', $o->status_id),
            'source' => ($lp['source'] ?? '') === 'new-ui' ? 'new-ui' : 'old-site',
            'createdAt' => $view['createdAt'], 'updatedAt' => $view['updatedAt'],
            'usageLicense' => $view['usageLicense'], 'delivery' => $view['delivery'], 'deadlineDays' => $view['deadlineDays'],
            'deliverableAudioUrl' => $view['deliverableAudioUrl'], 'review' => $view['review'],
            'customer' => self::person($customer, ['name' => $contact['name'] ?? $o->customer_full_name, 'email' => $email, 'phone' => $contact['whatsapp'] ?? $o->customer_phone])
                + ['history' => $history, 'repeatCustomer' => $history['bookings'] > 1],
            // the old relation filters some narrators out (account type): the account itself is enough here
            'narrator' => self::person($o->voiceActor ?: ($o->voice_actor_id ? User::withoutGlobalScopes()->find($o->voice_actor_id) : null)),
            'sample' => $sample ? ['id' => (string) ($sample['id'] ?? ''), 'name' => (string) ($sample['sampleName'] ?? ''), 'dialect' => (string) ($sample['dialect'] ?? ''),
                'language' => (string) ($sample['language'] ?? ''), 'category' => (string) ($sample['category'] ?? ''), 'audioUrl' => (string) ($sample['previewUrl'] ?? '')] : null,
            'script' => $script, 'notes' => (string) $view['notes'],
            'words' => (int) ($lp['script']['numberOfWords'] ?? ($lines[0]['words'] ?? 0)), 'minutes' => (float) ($lp['script']['numberOfMinutes'] ?? ($view['durationMinutes'] ?? 0)),
            'pricePerMinute' => (float) ($lp['script']['pricePerMinute'] ?? ($voiceItem->unit_price ?? 0)),
            'lines' => $lines,
            'money' => ['totalUsd' => $total, 'narratorUsd' => round($share, 2), 'platformUsd' => round($total - $share, 2), 'commissionPct' => $view['commissionPct'],
                'discountUsd' => (float) $o->discount_value, 'paymentFeeUsd' => (float) $o->payment_method_value],
            'payments' => $payments, 'cancellations' => $cancellations, 'messages' => $messages, 'ratings' => $ratings,
        ];
    }
}
