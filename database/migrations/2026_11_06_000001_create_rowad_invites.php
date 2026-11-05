<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * «روّاد قيمة» invites.
 * The TTS credits ledger already exists (qv_credit_transactions), so instead of a second ledger it gets the columns
 * the spec asks for: entry type, the remaining part of each grant, source, expiry and an idempotency key.
 * The balance is the sum of the valid entries (App\Services\NewUi\Accounts::balance()).
 */
class CreateRowadInvites extends Migration
{
    public function up()
    {
        Schema::create('invites', function (Blueprint $t) {
            $t->id();
            $t->string('code', 16)->unique();
            $t->unsignedBigInteger('client_id')->nullable()->index();
            $t->string('email')->nullable()->index();
            $t->string('name')->nullable();
            $t->string('phone', 40)->nullable();
            $t->string('campaign', 40)->default('rowad_2026');
            $t->enum('status', ['created', 'sent', 'opened', 'redeemed', 'expired'])->default('created')->index();
            $t->timestamp('sent_at')->nullable();
            $t->timestamp('opened_at')->nullable();
            $t->timestamp('redeemed_at')->nullable();
            $t->unsignedBigInteger('redeemed_by_user_id')->nullable()->index();
            $t->boolean('email_mismatch')->default(false);
            $t->timestamp('expires_at')->nullable();
            $t->timestamps();
        });

        Schema::table('users', function (Blueprint $t) {
            $t->boolean('early_access')->default(false);
            $t->timestamp('rowad_badge_at')->nullable();
            $t->timestamp('rowad_price_until')->nullable();
        });

        Schema::table('qv_credit_transactions', function (Blueprint $t) {
            $t->string('type', 10)->default('adjust');   // grant | spend | expire | reversal | adjust
            $t->integer('remaining')->nullable();        // what is left of a grant that expires
            $t->string('source', 30)->nullable();        // early_access | topup | plan | signup ...
            $t->timestamp('expires_at')->nullable()->index();
            $t->timestamp('reminded_at')->nullable();    // expiry reminder e-mail sent
            $t->string('idempotency_key', 80)->nullable()->unique();
            $t->text('meta')->nullable();                // JSON: price paid, list price, applied offer...
        });

        // Rowad price locked on the client's subscription
        Schema::table('qv_client_accounts', function (Blueprint $t) {
            $t->string('locked_plan_id', 40)->nullable();
            $t->decimal('locked_price', 10, 2)->nullable();
            $t->timestamp('locked_until')->nullable();
        });
    }

    public function down()
    {
        Schema::table('qv_client_accounts', function (Blueprint $t) {
            $t->dropColumn(['locked_plan_id', 'locked_price', 'locked_until']);
        });
        Schema::table('qv_credit_transactions', function (Blueprint $t) {
            $t->dropUnique(['idempotency_key']);
            $t->dropIndex(['expires_at']);
            $t->dropColumn(['type', 'remaining', 'source', 'expires_at', 'reminded_at', 'idempotency_key', 'meta']);
        });
        Schema::table('users', function (Blueprint $t) {
            $t->dropColumn(['early_access', 'rowad_badge_at', 'rowad_price_until']);
        });
        Schema::dropIfExists('invites');
    }
}
