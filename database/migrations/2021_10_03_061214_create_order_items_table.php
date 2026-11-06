<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrderItemsTable extends Migration
{

    public function up()
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('itemable_id');
            $table->string('itemable_type');
            $table->text('item')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('unit_price', 18, 2)->unsigned();
            $table->decimal('percentage', 18, 2)->nullable()->unsigned();
            $table->decimal('line_total', 18, 2)->unsigned();
            $table->timestamps();
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
        });
    }


    public function down()
    {
        Schema::dropIfExists('order_items');
    }
}
