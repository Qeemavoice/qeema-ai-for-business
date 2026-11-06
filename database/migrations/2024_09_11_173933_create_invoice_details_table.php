<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInvoiceDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('invoice_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('invoice_id');
            $table->morphs('itemable');
            $table->decimal('price', 18, 2)->nullable()->unsigned()->default(0)->default(0);
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
            $table->timestamps();
            $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('invoice_details');
    }
}
