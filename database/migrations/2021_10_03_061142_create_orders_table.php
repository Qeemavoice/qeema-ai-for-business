<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrdersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('voice_actor_id')->nullable()->index();
            $table->unsignedBigInteger('customer_id')->nullable()->index();
            $table->string('customer_email')->nullable();
            $table->string('customer_phone')->nullable();
            $table->string('customer_full_name')->nullable();
            $table->string('billing_full_name')->nullable();
//            $table->decimal('tax_percentage', 18, 2)->unsigned()->nullable();
//            $table->decimal('tax_value', 18, 2)->unsigned()->nullable();
            $table->unsignedBigInteger('coupon_id')->nullable()->index();
            $table->decimal('discount_percentage', 18, 2)->unsigned()->nullable();
            $table->decimal('discount_value', 18, 2)->unsigned()->nullable();
            $table->unsignedBigInteger('payment_method_id');
            $table->decimal('payment_method_percentage', 18, 2)->unsigned()->nullable();
            $table->decimal('payment_method_value', 18, 2)->unsigned()->nullable();
            $table->decimal('sub_total', 18, 2)->unsigned();
            $table->decimal('total', 18, 2)->unsigned();
            $table->string('note')->nullable();
            $table->json('list_of_price')->nullable();
            $table->boolean('is_old')->nullable();
            $table->unsignedBigInteger('currency_id')->nullable();
            $table->unsignedBigInteger('status_id');
            $table->softDeletes();
            $table->timestamps();
            $table->foreign('status_id')->references('id')->on('order_statuses')->onDelete('cascade');
            $table->foreign('coupon_id')->references('id')->on('coupons')->onDelete('cascade');
            $table->foreign('payment_method_id')->references('id')->on('payment_methods')->onDelete('cascade');
            $table->foreign('customer_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('voice_actor_id')->references('id')->on('users')->onDelete('cascade');
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
        Schema::dropIfExists('orders');
    }
}
