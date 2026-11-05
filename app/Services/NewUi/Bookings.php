<?php

namespace App\Services\NewUi;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemDetail;
use App\Models\OrderStatus;
use App\Models\OrderType;
use App\Models\PaymentMethod;
use App\Models\User;
use App\Models\Voice;
use App\Services\CurrencyHelper;
use Illuminate\Support\Facades\DB;

/**
 * Human voice bookings of the new UI stored as rows of the existing `orders` table
 * (+ order_items / order_item_details), so the old admin panel, wallets and reports keep seeing them.
 * Fields the old table lacks (delivery option, licence, review, pipeline status...) live in qv_booking_meta.
 */
class Bookings
{
    public const CHARS_PER_MINUTE = 100;
    public const DEFAULT_PRICE_PER_MINUTE_USD = 40;
    public const MAX_EXPRESS_MINUTES = 5;
    public const DELIVERY = ['48h' => [2, 0], '24h' => [1, 10], '6h' => [1, 15]];
    public const LICENSES = ['commercial_ads', 'internal_corporate', 'broadcast_tv', 'elearning', 'ivr', 'global_license'];
    public const STATUSES = ['pending', 'in_studio', 'delivered', 'approved', 'canceled'];

    public static function id(Order $o): string
    {
        return 'BOK-' . $o->id;
    }

    public static function orderId(string $id): ?int
    {
        return preg_match('/(\d+)$/', $id, $m) ? (int) $m[1] : null;
    }

    public static function meta(int $orderId): ?object
    {
        return DB::table('qv_booking_meta')->where('order_id', $orderId)->first();
    }

    public static function saveMeta(int $orderId, array $cols): void
    {
        $cols['updated_at'] = now();
        if (DB::table('qv_booking_meta')->where('order_id', $orderId)->exists()) {
            DB::table('qv_booking_meta')->where('order_id', $orderId)->update($cols);
        } else {
            DB::table('qv_booking_meta')->insert(array_merge(['order_id' => $orderId, 'created_at' => now()], $cols));
        }
    }

    /** New-UI pipeline status of an order (pending → in_studio → delivered → approved) */
    public static function status(Order $o, ?object $meta): string
    {
        if ($meta && $meta->qv_status) return $meta->qv_status;
        switch ((int) $o->status_id) {
            case OrderStatus::ACCEPTED:
            case OrderStatus::IN_PROGRESS:
                return 'in_studio';
            case OrderStatus::COMPLETED:
                return 'delivered';
            case OrderStatus::REJECTED:
            case OrderStatus::CANCELED:
                return 'canceled';
            default:
                return 'pending';
        }
    }

    private static function oldStatus(string $status): int
    {
        return ['pending' => OrderStatus::PENDING, 'in_studio' => OrderStatus::IN_PROGRESS, 'delivered' => OrderStatus::COMPLETED, 'approved' => OrderStatus::COMPLETED, 'canceled' => OrderStatus::CANCELED][$status] ?? OrderStatus::PENDING;
    }

    public static function query()
    {
        return Order::query()->where('order_type_id', OrderType::BOOKING_VOICE)->with(['items.details', 'voiceActor', 'customer']);
    }

    /** Full booking (admin view). Contact details and payout are included. */
    public static function view(Order $o, ?object $meta = null, ?array $voice = null): array
    {
        $meta = $meta ?: self::meta($o->id);
        $item = $o->items->first();
        $detail = $item ? $item->details : null;
        $script = (string) ($item->item ?? '');
        $chars = $meta->char_count ?? mb_strlen($script);
        $minutes = $meta->duration_minutes ?? ($detail->number_of_minutes ?? max(1, (int) ceil($chars / self::CHARS_PER_MINUTE)));
        $voiceActor = $o->voiceActor;
        $customer = $o->customer;
        $review = $meta && $meta->review ? json_decode($meta->review, true) : null;
        $contact = $meta && $meta->customer_contact ? json_decode($meta->customer_contact, true)
            : ['name' => (string) $o->customer_full_name, 'email' => (string) $o->customer_email, 'whatsapp' => (string) $o->customer_phone];
        return [
            'id' => self::id($o),
            'companyId' => $customer ? 'c' . $customer->id : 'c' . $o->customer_id,
            'companyName' => $customer ? Accounts::name($customer) : (string) $o->customer_full_name,
            'talentId' => $voiceActor ? 'narrator_u' . $voiceActor->id : (string) $o->voice_actor_id,
            'talentName' => $voiceActor ? Accounts::name($voiceActor) : '',
            'scriptText' => $script,
            'deadlineDays' => $meta && $meta->delivery ? (self::DELIVERY[$meta->delivery][0] ?? 0) : 2,
            'usageLicense' => $meta->usage_license ?? 'commercial_ads',
            'notes' => (string) ($item->notes ?? $o->note ?? ''),
            'priceUsd' => (float) $o->total,
            'talentPayoutUsd' => (float) ($meta->talent_payout_usd ?? $o->sub_total),
            'paymentModel' => 'direct_escrow_100',
            'status' => self::status($o, $meta),
            'deliverableAudioUrl' => $meta->deliverable_url ?? null,
            'review' => $review,
            'sampleId' => $meta->sample_id ?? ($item && $item->itemable_id ? (string) $item->itemable_id : null),
            'sampleName' => $voice['sampleName'] ?? '',
            'dialect' => $voice['dialect'] ?? '',
            'delivery' => $meta->delivery ?? '48h',
            'charCount' => (int) $chars,
            'durationMinutes' => (int) $minutes,
            'customerContact' => $contact,
            'createdAt' => Store::iso(Store::created($o, 'created_at')),
            'updatedAt' => Store::iso(Store::created($o, 'updated_at')),
        ];
    }

    /** What the client may see: no payout, no contact details */
    public static function clientView(Order $o, ?array $voice = null): array
    {
        $v = self::view($o, null, $voice);
        $r = $v['review'];
        return [
            'id' => $v['id'], 'status' => $v['status'], 'scriptText' => $v['scriptText'], 'notes' => $v['notes'], 'usageLicense' => $v['usageLicense'],
            'deadlineDays' => $v['deadlineDays'], 'delivery' => $v['delivery'], 'priceUsd' => $v['priceUsd'], 'createdAt' => $v['createdAt'], 'updatedAt' => $v['updatedAt'],
            'talentName' => $v['talentName'], 'sampleId' => $v['sampleId'], 'sampleName' => $v['sampleName'], 'dialect' => $v['dialect'],
            'charCount' => $v['charCount'], 'durationMinutes' => $v['durationMinutes'], 'deliverableAudioUrl' => $v['deliverableAudioUrl'],
            'review' => $r ? ['rating' => $r['rating'], 'text' => $r['text'], 'createdAt' => $r['createdAt'], 'status' => $r['status']] : null,
        ];
    }

    public static function all(): array
    {
        $voices = Library::byId();
        return self::query()->orderByDesc('created_at')->get()
            ->map(function ($o) use ($voices) { $m = self::meta($o->id); return self::view($o, $m, $voices[$m->sample_id ?? ''] ?? null); })->all();
    }

    public static function forCustomer(int $userId): array
    {
        $voices = Library::byId();
        return self::query()->where('customer_id', $userId)->orderByDesc('created_at')->get()
            ->map(function ($o) use ($voices) { $m = self::meta($o->id); return self::clientView($o, $voices[$m->sample_id ?? ''] ?? null); })->all();
    }

    /**
     * The booking form: the request enters as "pending" and the admins review it. The price is recomputed here.
     * @return array booking (client view) or ['error' => ..., 'status' => code]
     */
    public static function create(array $in, ?User $user): array
    {
        $script = trim((string) ($in['scriptText'] ?? ''));
        if ($script === '') return ['error' => 'اكتب نص المشروع', 'status' => 400];
        $sampleId = (string) ($in['sampleId'] ?? '');
        $voice = $sampleId ? Library::find($sampleId) : null;
        if (!$voice) return ['error' => 'اختر الصوت المطلوب من مكتبة الأصوات', 'status' => 400];
        $license = in_array($in['usageLicense'] ?? '', self::LICENSES, true) ? $in['usageLicense'] : 'commercial_ads';
        $contact = [
            'name' => mb_substr(trim((string) ($in['customerName'] ?? ($user ? Accounts::name($user) : ''))), 0, 120),
            'email' => mb_substr(trim((string) ($in['customerEmail'] ?? ($user->email ?? ''))), 0, 160),
            'whatsapp' => mb_substr(trim((string) ($in['customerWhatsapp'] ?? ($user->mobile ?? ''))), 0, 40),
        ];
        if (!$contact['name'] || !$contact['email'] || strlen(preg_replace('/\D/', '', $contact['whatsapp'])) < 8) {
            return ['error' => 'أدخل الاسم والبريد ورقم واتساب صحيح', 'status' => 400];
        }

        $chars = mb_strlen($script);
        $minutes = max(1, (int) ceil($chars / self::CHARS_PER_MINUTE));
        $isLong = $minutes > self::MAX_EXPRESS_MINUTES;
        $delivery = $isLong ? 'custom' : (isset(self::DELIVERY[$in['delivery'] ?? '']) ? $in['delivery'] : '48h');
        $opt = self::DELIVERY[$delivery] ?? [0, 0];
        $pct = Plans::commissionPercent();
        $narratorPrice = (float) ($voice['narratorPriceUsd'] ?: self::DEFAULT_PRICE_PER_MINUTE_USD);
        $perMinute = Plans::finalPrice($narratorPrice, $pct);
        $base = $minutes * $perMinute;
        $price = round($base + ($base * $opt[1]) / 100, 2);
        $payout = Plans::narratorShareOf($price, $pct);
        $notes = mb_substr((string) ($in['notes'] ?? ''), 0, 500);

        // The customer row: the signed-in client, or the account of that email (created when missing, as the old booking form did)
        $customer = $user ?: (Accounts::findByEmail($contact['email']) ?: Accounts::createAccount($contact['name'], $contact['email'], null, 'client', ['mobile' => $contact['whatsapp']]));

        try { $currencyId = CurrencyHelper::getId(); } catch (\Throwable $e) { $currencyId = 1; }

        $order = DB::transaction(function () use ($customer, $voice, $contact, $script, $notes, $chars, $minutes, $narratorPrice, $perMinute, $pct, $base, $price, $payout, $delivery, $license, $sampleId, $currencyId, $opt) {
            $o = new Order();
            $o->forceFill([
                'voice_actor_id' => $voice['talentUserId'],
                'customer_id' => $customer->id,
                'customer_full_name' => $contact['name'],
                'billing_full_name' => $contact['name'],
                'customer_phone' => $contact['whatsapp'],
                'customer_email' => $contact['email'],
                'payment_method_id' => PaymentMethod::BANK_TRANSFER,
                'payment_method_percentage' => 0,
                'payment_method_value' => 0,
                'sub_total' => round($minutes * $narratorPrice, 2),
                'total' => $price,
                'currency_id' => $currencyId,
                'list_of_price' => json_encode([
                    'source' => 'new-ui', 'script' => ['numberOfWords' => str_word_count($script) ?: count(preg_split('/\s+/u', $script)), 'numberOfMinutes' => $minutes,
                        'pricePerMinute' => $narratorPrice, 'platFormCommission' => ['percentage' => $pct, 'value' => round($perMinute - $narratorPrice, 2)],
                        'subTotal' => round($minutes * $narratorPrice, 2), 'total' => $base],
                    'delivery' => ['option' => $delivery, 'surchargePct' => $opt[1]], 'total' => $price, 'talentPayoutUsd' => $payout,
                ], JSON_UNESCAPED_UNICODE),
                'note' => $notes,
                'status_id' => OrderStatus::PENDING,
                'order_type_id' => OrderType::BOOKING_VOICE,
            ])->save();

            $item = new OrderItem();
            $item->forceFill([
                'order_id' => $o->id, 'itemable_id' => $voice['voiceRowId'] ?: 0, 'itemable_type' => Voice::class, 'item' => $script, 'notes' => $notes,
                'unit_price' => $narratorPrice, 'percentage' => $pct, 'line_total' => $price,
            ])->save();
            $d = new OrderItemDetail();
            $d->forceFill([
                'item_id' => $item->id, 'voice_audio_file' => $voice['audioFile'], 'notes' => $notes, 'language_id' => $voice['languageId'],
                'category_id' => $voice['categoryId'], 'dialect_id' => $voice['dialectId'], 'voice_type_id' => $voice['voiceTypeId'],
                'word_count' => count(preg_split('/\s+/u', $script)), 'number_of_minutes' => $minutes,
            ])->save();

            self::saveMeta($o->id, [
                'sample_id' => $sampleId, 'delivery' => $delivery, 'usage_license' => $license, 'char_count' => $chars, 'duration_minutes' => $minutes,
                'talent_payout_usd' => $payout, 'qv_status' => 'pending', 'customer_contact' => json_encode($contact, JSON_UNESCAPED_UNICODE),
            ]);
            if ($voice['voiceRowId']) Voice::where('id', $voice['voiceRowId'])->increment('number_of_orders');
            return $o;
        });

        Store::audit('c' . $customer->id, 'client', 'BOOKING_CREATED: ' . self::id($order));
        $order->load(['items.details', 'voiceActor', 'customer']);
        return ['booking' => self::clientView($order, $voice)];
    }

    public static function setStatus(string $id, string $status, ?string $deliverableUrl = null): ?array
    {
        $oid = self::orderId($id);
        $o = $oid ? self::query()->find($oid) : null;
        if (!$o) return null;
        $o->status_id = self::oldStatus($status);
        $o->save();
        $cols = ['qv_status' => $status];
        if ($deliverableUrl) $cols['deliverable_url'] = $deliverableUrl;
        self::saveMeta($o->id, $cols);
        Store::audit('c' . $o->customer_id, 'admin', 'BOOKING_STATUS_UPDATE: ' . self::id($o) . " -> {$status}", ['status' => $status, 'deliverableUrl' => $deliverableUrl]);
        return self::view($o->fresh(['items.details', 'voiceActor', 'customer']));
    }

    /** Talent payouts ledger: earned = payouts of completed bookings; paid = settlements recorded in qv_talent_payouts */
    public static function payouts(): array
    {
        $byTalent = [];
        foreach (self::query()->get() as $o) {
            $m = self::meta($o->id);
            $actor = $o->voiceActor;
            if (!$actor) continue;
            $tid = 'narrator_u' . $actor->id;
            $byTalent[$tid] = $byTalent[$tid] ?? ['talentId' => $tid, 'talentName' => Accounts::name($actor), 'avatar' => $actor->image ? $actor->image_url : '', 'dialect' => '', 'completedBookingsCount' => 0, 'totalEarningsUsd' => 0.0];
            if (in_array(self::status($o, $m), ['delivered', 'approved'], true)) {
                $byTalent[$tid]['completedBookingsCount']++;
                $byTalent[$tid]['totalEarningsUsd'] += (float) ($m->talent_payout_usd ?? $o->sub_total);
            }
        }
        $saved = DB::table('qv_talent_payouts')->get()->keyBy('talent_id');
        $out = [];
        foreach ($byTalent as $tid => $p) {
            $s = $saved[$tid] ?? null;
            $paid = (float) ($s->paid_out_usd ?? 0);
            $out[] = array_merge($p, [
                'totalEarningsUsd' => round($p['totalEarningsUsd'], 2), 'paidOutUsd' => round($paid, 2),
                'pendingBalanceUsd' => round(max(0, $p['totalEarningsUsd'] - $paid), 2),
                'iban' => $s->iban ?? '', 'bankName' => $s->bank_name ?? '', 'status' => $s->status ?? 'active', 'lastPayoutDate' => $s->last_payout_date ?? null,
            ]);
        }
        return $out;
    }

    public static function processPayout(string $talentId, ?float $amount): ?array
    {
        $p = null;
        foreach (self::payouts() as $row) if ($row['talentId'] === $talentId) { $p = $row; break; }
        if (!$p) return null;
        $pay = $amount ?? $p['pendingBalanceUsd'];
        $paid = $p['paidOutUsd'] + $pay;
        DB::table('qv_talent_payouts')->updateOrInsert(['talent_id' => $talentId], [
            'talent_name' => $p['talentName'], 'avatar' => $p['avatar'], 'dialect' => $p['dialect'], 'completed_bookings_count' => $p['completedBookingsCount'],
            'total_earnings_usd' => $p['totalEarningsUsd'], 'paid_out_usd' => $paid, 'pending_balance_usd' => max(0, $p['totalEarningsUsd'] - $paid),
            'status' => 'settled', 'last_payout_date' => date('Y-m-d'), 'updated_at' => now(), 'created_at' => now(),
        ]);
        Store::audit('system', 'admin', "PAYOUT_PROCESSED: {$p['talentName']} -> \${$pay} USD", ['talentId' => $talentId, 'payoutAmount' => $pay]);
        foreach (self::payouts() as $row) if ($row['talentId'] === $talentId) return $row;
        return null;
    }
}
