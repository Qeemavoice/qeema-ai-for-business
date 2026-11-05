<?php

use App\Models\HoldPayment;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateHoldPaymentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('hold_payments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('transaction_id')->nullable();
            $table->unsignedBigInteger('wallet_id');
            $table->string('value')->nullable();
            $table->enum('status', [
                HoldPayment::HOLD,
                HoldPayment::RELEASED
            ])->nullable()->comment(HoldPayment::HOLD . ':hold' . ' ' . HoldPayment::RELEASED . ':release');
            $table->timestamp('expected_release_date')->nullable();
            $table->timestamp('release_date')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->foreign('transaction_id')->on('transactions')->references('id')->onDelete(ON_DELETE);
            $table->foreign('wallet_id')->on('wallets')->references('id')->onDelete(ON_DELETE);
        });
    }


    public function down()
    {
        Schema::dropIfExists('hold_payments');
    }
}
