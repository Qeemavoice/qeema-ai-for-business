<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tts_credit_payments', function (Blueprint $table) {
            $table->unsignedBigInteger('amount_cents')->default(0)->after('credits');
            $table->string('currency', 3)->default('usd')->after('amount_cents');
        });
    }

    public function down(): void
    {
        Schema::table('tts_credit_payments', function (Blueprint $table) {
            $table->dropColumn(['amount_cents', 'currency']);
        });
    }
};
