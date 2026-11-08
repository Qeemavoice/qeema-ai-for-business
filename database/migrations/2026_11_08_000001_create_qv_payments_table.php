<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Card payments of the new UI (Stripe Checkout): one row per checkout, fulfilled once after Stripe says it is paid */
class CreateQvPaymentsTable extends Migration
{
    public function up()
    {
        Schema::create('qv_payments', function (Blueprint $t) {
            $t->string('id', 40)->primary();
            $t->string('session_id', 255)->nullable()->unique();
            $t->string('kind', 20);                       // topup | plan | guide
            $t->unsignedBigInteger('user_id')->index();   // who paid
            $t->unsignedBigInteger('company_user_id');    // whose account receives it
            $t->unsignedInteger('amount_cents');
            $t->string('currency', 3)->default('usd');
            $t->string('status', 20)->default('pending'); // pending | fulfilled | failed
            $t->string('buyer_name', 160)->nullable();
            $t->string('buyer_email', 160)->nullable();
            $t->json('meta');
            $t->string('payment_intent', 255)->nullable();
            $t->boolean('livemode')->default(false);
            $t->timestamp('fulfilled_at')->nullable();
            $t->timestamps();
            $t->index(['kind', 'status']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('qv_payments');
    }
}
