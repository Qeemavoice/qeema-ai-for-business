<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tables for the new Qeema Voice UI (React, served from public/new-ui).
 * Only NEW tables plus two nullable columns on contact_us: nothing existing is changed or dropped.
 */
class CreateQvTables extends Migration
{
    public function up()
    {
        // Key/value JSON store: system settings, integrations (SMTP/Stripe), narrator dashboard state, OTP codes
        Schema::create('qv_kv', function (Blueprint $t) {
            $t->string('key', 120)->primary();
            $t->longText('value');
            $t->timestamps();
        });

        // Dashboard collections that have no table in the old project (stories, pageTexts, voiceTemplates, services, feedback, admins)
        Schema::create('qv_collections', function (Blueprint $t) {
            $t->string('id', 80)->primary();
            $t->string('name', 40)->index();
            $t->longText('data');
            $t->timestamps();
        });

        // TTS studio voices uploaded by the admin team (استوديو TTS ← الأصوات)
        Schema::create('qv_tts_voices', function (Blueprint $t) {
            $t->string('id', 60)->primary();
            $t->string('name', 120);
            $t->string('name_en', 120)->nullable();
            $t->string('gender', 10)->default('male');
            $t->string('dialect', 20)->default('gulf');
            $t->string('dialect_label', 120)->nullable();
            $t->string('style', 30)->default('commercial');
            $t->string('style_label', 120)->nullable();
            $t->text('use_cases')->nullable();
            $t->string('provider', 30)->default('elevenlabs');
            $t->string('provider_voice_id', 120)->nullable();
            $t->longText('preview_url')->nullable();
            $t->text('avatar')->nullable();
            $t->string('narrator_id', 80)->nullable()->index();
            $t->decimal('narrator_share_percent', 5, 2)->nullable();
            $t->boolean('is_active')->default(true);
            $t->boolean('is_featured')->default(false);
            $t->unsignedInteger('bookings_count')->default(0);
            $t->timestamps();
        });

        // Client workspace of a users row (plan, credits are in the ledger, projects, team invites, favourites)
        Schema::create('qv_client_accounts', function (Blueprint $t) {
            $t->unsignedBigInteger('user_id')->primary();
            $t->string('plan_id', 40)->default('plan-free');
            $t->string('status', 12)->default('active');
            $t->string('industry', 120)->nullable();
            $t->string('country', 120)->nullable();
            $t->longText('notes')->nullable();
            $t->longText('projects')->nullable();
            $t->longText('team_invites')->nullable();
            $t->text('saved_voice_ids')->nullable();
            $t->timestamps();
        });

        // Credits ledger (1 credit = 1 character); the balance is the last balance_after
        Schema::create('qv_credit_transactions', function (Blueprint $t) {
            $t->string('id', 60)->primary();
            $t->unsignedBigInteger('user_id')->index();
            $t->unsignedBigInteger('actor_user_id')->nullable();
            $t->integer('delta');
            $t->integer('balance_after');
            $t->string('reason', 30);
            $t->string('reference_id', 80)->nullable();
            $t->text('description')->nullable();
            $t->dateTime('created_at')->index();
        });

        // TTS generations (audio files live in storage/app/qv-audio)
        Schema::create('qv_generations', function (Blueprint $t) {
            $t->string('id', 60)->primary();
            $t->unsignedBigInteger('user_id')->index();
            $t->unsignedBigInteger('actor_user_id')->nullable();
            $t->string('voice_id', 60);
            $t->string('voice_name', 120);
            $t->string('voice_type', 10)->default('ai');
            $t->string('dialect', 20)->nullable();
            $t->longText('text');
            $t->unsignedInteger('text_chars');
            $t->text('settings')->nullable();
            $t->string('provider', 60)->nullable();
            $t->string('model', 60)->nullable();
            $t->string('audio_path')->nullable();
            $t->string('mime', 40)->default('audio/mpeg');
            $t->decimal('duration_seconds', 8, 2)->default(0);
            $t->string('status', 16)->default('completed');
            $t->unsignedInteger('credits_consumed')->default(0);
            $t->decimal('cost_usd', 10, 4)->default(0);
            $t->dateTime('created_at')->index();
        });

        // What a narrator earns when his TTS voice is used
        Schema::create('qv_narrator_earnings', function (Blueprint $t) {
            $t->string('id', 60)->primary();
            $t->string('narrator_id', 80)->index();
            $t->string('voice_id', 60);
            $t->string('voice_name', 120);
            $t->string('generation_id', 60);
            $t->unsignedBigInteger('company_user_id');
            $t->unsignedInteger('chars');
            $t->decimal('gross_usd', 10, 4)->default(0);
            $t->decimal('share_percent', 5, 2)->default(0);
            $t->decimal('narrator_usd', 10, 4)->default(0);
            $t->decimal('platform_usd', 10, 4)->default(0);
            $t->dateTime('created_at')->index();
        });

        // Extra booking fields the new UI needs; the booking itself is a row of the existing `orders` table
        Schema::create('qv_booking_meta', function (Blueprint $t) {
            $t->unsignedBigInteger('order_id')->primary();
            $t->string('sample_id', 80)->nullable();
            $t->string('delivery', 12)->nullable();
            $t->string('usage_license', 32)->nullable();
            $t->unsignedInteger('char_count')->nullable();
            $t->unsignedInteger('duration_minutes')->nullable();
            $t->decimal('talent_payout_usd', 10, 2)->nullable();
            $t->text('deliverable_url')->nullable();
            $t->longText('review')->nullable();
            $t->string('qv_status', 16)->nullable();
            $t->text('customer_contact')->nullable();
            $t->timestamps();
        });

        // Audit trail of the new admin dashboard
        Schema::create('qv_audit_logs', function (Blueprint $t) {
            $t->string('id', 60)->primary();
            $t->string('company_id', 60)->index();
            $t->string('actor', 80);
            $t->string('action', 255);
            $t->text('metadata')->nullable();
            $t->dateTime('created_at')->index();
        });

        // Talent payouts ledger (admin «الأرباح»)
        Schema::create('qv_talent_payouts', function (Blueprint $t) {
            $t->string('talent_id', 80)->primary();
            $t->string('talent_name', 120);
            $t->text('avatar')->nullable();
            $t->string('dialect', 120)->nullable();
            $t->unsignedInteger('completed_bookings_count')->default(0);
            $t->decimal('total_earnings_usd', 12, 2)->default(0);
            $t->decimal('paid_out_usd', 12, 2)->default(0);
            $t->decimal('pending_balance_usd', 12, 2)->default(0);
            $t->string('iban', 60)->nullable();
            $t->string('bank_name', 120)->nullable();
            $t->string('status', 20)->default('active');
            $t->date('last_payout_date')->nullable();
            $t->timestamps();
        });

        // Contact messages (old form writes mail_messages): read/unread flag of the new admin «الرسائل البريدية» (nullable, additive)
        if (Schema::hasTable('mail_messages') && !Schema::hasColumn('mail_messages', 'qv_status')) {
            Schema::table('mail_messages', function (Blueprint $t) {
                $t->string('qv_status', 12)->nullable();
            });
        }
    }

    public function down()
    {
        foreach (['qv_talent_payouts', 'qv_audit_logs', 'qv_booking_meta', 'qv_narrator_earnings', 'qv_generations',
                  'qv_credit_transactions', 'qv_client_accounts', 'qv_tts_voices', 'qv_collections', 'qv_kv'] as $table) {
            Schema::dropIfExists($table);
        }
        if (Schema::hasTable('mail_messages') && Schema::hasColumn('mail_messages', 'qv_status')) {
            Schema::table('mail_messages', function (Blueprint $t) {
                $t->dropColumn('qv_status');
            });
        }
    }
}
