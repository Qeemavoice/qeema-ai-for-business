<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * جداول الشات منفصلة عن جداول الموقع الحالية، فلا تؤثر على أي شيء موجود.
 * qv_chat_talents يرتبط بالمعلق الحالي عبر talent_code (رقم جواز الصوت) أو legacy_user_id.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('qv_chat_talents', function (Blueprint $t) {
            $t->id();
            $t->string('talent_code', 32)->unique();          // QV-0142
            $t->unsignedBigInteger('legacy_user_id')->nullable()->index(); // رقم المعلق في الموقع الحالي
            $t->string('name');
            $t->json('dialects');                              // ["sa_najdi","msa"]
            $t->string('gender', 10);                          // male | female
            $t->string('age_range', 10)->nullable();           // young | middle | mature
            $t->json('tones');                                 // ["دافئ","واثق"]
            $t->json('use_cases');                             // ["ad","corporate"]
            $t->decimal('price_per_minute_usd', 8, 2);
            $t->unsignedSmallInteger('turnaround_days')->default(3);
            $t->boolean('available')->default(true);
            $t->string('sample_url');
            $t->string('photo_url')->nullable();
            $t->string('profile_url')->nullable();
            $t->boolean('has_clone')->default(false);
            $t->string('elevenlabs_voice_id')->nullable();     // لا يُرسل للواجهة أبدًا
            $t->date('clone_consent_date')->nullable();
            $t->decimal('ai_price_per_minute_usd', 8, 2)->nullable();
            $t->boolean('verified_human')->default(true);
            $t->timestamps();
        });

        Schema::create('qv_chat_leads', function (Blueprint $t) {
            $t->id();
            $t->string('phone', 20)->unique();
            $t->string('name')->nullable();
            $t->string('email')->nullable();
            $t->timestamp('verified_at')->nullable();
            $t->string('otp_hash')->nullable();
            $t->timestamp('otp_expires_at')->nullable();
            $t->unsignedTinyInteger('otp_attempts')->default(0);
            $t->unsignedInteger('previews_used')->default(0);
            $t->unsignedInteger('bonus_previews')->default(0);
            $t->string('device_id', 64)->nullable()->index();
            $t->string('ip', 45)->nullable();
            $t->timestamps();
        });

        Schema::create('qv_chat_conversations', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignId('lead_id')->nullable()->index();
            $t->string('device_id', 64)->nullable()->index();
            $t->string('ip', 45)->nullable();
            $t->longText('history')->nullable();               // السجل بصيغة محايدة (JSON)
            $t->json('brief')->nullable();                     // آخر بيانات طلب جُمعت
            $t->longText('script')->nullable();                // سيناريو العميل
            $t->json('last_results')->nullable();              // رموز آخر المرشحين
            $t->unsignedInteger('message_count')->default(0);
            $t->string('user_type', 10)->nullable();           // client | artist
            $t->string('status', 20)->default('open');         // open | ordered | handoff
            $t->timestamps();
        });

        Schema::create('qv_chat_previews', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('conversation_id')->index();
            $t->foreignId('lead_id')->nullable()->index();
            $t->foreignId('talent_id')->index();
            $t->text('text');
            $t->unsignedInteger('chars');
            $t->string('model', 64);
            $t->string('file_path');
            $t->string('cache_key', 64)->index();
            $t->string('device_id', 64)->nullable()->index();
            $t->string('ip', 45)->nullable()->index();
            $t->timestamp('expires_at');
            $t->timestamps();
        });

        Schema::create('qv_chat_requests', function (Blueprint $t) {
            $t->id();
            $t->string('type', 24);                            // order_human | order_ai | handoff | artist_support
            $t->uuid('conversation_id')->index();
            $t->foreignId('lead_id')->nullable()->index();
            $t->foreignId('talent_id')->nullable();
            $t->string('reason', 40)->nullable();
            $t->text('summary')->nullable();
            $t->json('brief')->nullable();
            $t->longText('script')->nullable();
            $t->text('notes')->nullable();
            $t->string('status', 20)->default('new');          // new | contacted | done | cancelled
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qv_chat_requests');
        Schema::dropIfExists('qv_chat_previews');
        Schema::dropIfExists('qv_chat_conversations');
        Schema::dropIfExists('qv_chat_leads');
        Schema::dropIfExists('qv_chat_talents');
    }
};
