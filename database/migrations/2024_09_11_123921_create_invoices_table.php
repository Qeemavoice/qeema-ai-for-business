<?php

use App\Models\Invoice;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInvoicesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('number')->nullable();
            $table->integer('is_sent')->nullable();
            $table->decimal('due_value', 18, 2)->nullable()->unsigned()->default(0);
            $table->decimal('price', 18, 2)->nullable()->unsigned()->default(0);
            $table->decimal('sub_total', 18, 2)->nullable()->unsigned()->default(0);
            $table->decimal('total', 18, 2)->nullable()->unsigned()->default(0);
            $table->decimal('tax_percentage', 18, 2)->nullable()->unsigned()->default(0);
            $table->decimal('tax_value', 18, 2)->nullable()->unsigned()->default(0);
            $table->decimal('discount_percentage', 18, 2)->nullable()->unsigned()->default(0);
            $table->decimal('discount_value', 18, 2)->nullable()->unsigned()->default(0);
            $table->decimal('total_discount_percentage', 18, 2)->nullable()->unsigned()->default(0);
            $table->decimal('total_discount_value', 18, 2)->nullable()->unsigned()->default(0);
            $table->decimal('total_tax_percentage', 18, 2)->nullable()->unsigned()->default(0);
            $table->decimal('total_tax_value', 18, 2)->nullable()->unsigned()->default(0);
            $table->enum('type', [Invoice::ORDER, Invoice::CREDITOR, Invoice::DEBTOR])->nullable()->comment("[ORDER, CREDITOR,DEBTOR]");
            $table->unsignedBigInteger('payment_status_id');
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('transaction_id');
            $table->unsignedBigInteger('payment_method_id');
            $table->timestamps();
            $table->foreign('payment_status_id')->references('id')->on('payment_statuses')->onDelete('cascade');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->foreign('transaction_id')->references('id')->on('transactions')->onDelete('cascade');
            $table->foreign('payment_method_id')->references('id')->on('payment_methods')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('invoices');
    }
}
