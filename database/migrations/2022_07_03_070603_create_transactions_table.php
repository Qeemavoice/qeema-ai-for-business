<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransactionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id')->unique()->nullable();
            $table->string('transaction_id');
            $table->unsignedBigInteger('methodable_id');
            $table->string('methodable_type');
            $table->unsignedBigInteger('payer_id')->nullable();
            $table->unsignedBigInteger('payee_id')->nullable();
            $table->unsignedBigInteger('transaction_status_id')->nullable();
            $table->unsignedBigInteger('currency_id')->nullable();
            $table->unsignedBigInteger('transaction_type_id')->nullable();
            $table->decimal('amount_paid', 18, 2)->unsigned();
            $table->decimal('receiving_amount', 18, 2)->unsigned();
            $table->decimal('transaction_fee', 18, 2)->unsigned();
            $table->text('response')->nullable();
            $table->text('description')->nullable();
            $table->string('receipt')->nullable();
            $table->softDeletes();
            $table->timestamps();
//            $table->foreign('payment_method_id')->references('id')->on('payment_methods')->onDelete('cascade');
            $table->foreign('transaction_type_id')->references('id')->on('transaction_types')->onDelete('cascade');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->foreign('payer_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('payee_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('transaction_status_id')->references('id')->on('transaction_statuses')->onDelete('cascade');
            $table->foreign('currency_id')->references('id')->on('currencies')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('transactions');
    }
}
