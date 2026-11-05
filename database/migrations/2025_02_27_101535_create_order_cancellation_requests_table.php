<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrderCancellationRequestsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('order_cancellation_requests', function (Blueprint $table) {
            $table->id();
            $table->text('reasons');
            $table->unsignedBigInteger('from_id')->nullable();
            $table->unsignedBigInteger('order_id')->nullable();
            $table->unsignedBigInteger('request_status_id')->nullable();
            $table->timestamps();
            $table->foreign('from_id')->references('id')->on('users')->onDelete(ON_DELETE);
            $table->foreign('order_id')->references('id')->on('orders')->onDelete(ON_DELETE);
            $table->foreign('request_status_id')->references('id')->on('request_statuses')->onDelete(ON_DELETE);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('order_cancellation_requests');
    }
}
