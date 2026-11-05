<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\Models\ProfitPayment;

class CreateProfitPaymentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('profit_payments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('transaction_id')->nullable();
            $table->unsignedBigInteger('wallet_id');
            $table->string('value')->nullable();
            $table->enum('status', [
                ProfitPayment::DEPOSIT,
                ProfitPayment::WITHDRAW
            ])->nullable()->comment(ProfitPayment::DEPOSIT . ':Deposit' . ' ' . ProfitPayment::WITHDRAW . ':Withdraw');
            $table->softDeletes();
            $table->timestamp('release_date')->nullable();
            $table->timestamps();
            $table->foreign('transaction_id')->on('transactions')->references('id')->onDelete(ON_DELETE);
            $table->foreign('wallet_id')->on('wallets')->references('id')->onDelete(ON_DELETE);
        });
    }


    public function down()
    {
        Schema::dropIfExists('profit_payments');
    }
}
