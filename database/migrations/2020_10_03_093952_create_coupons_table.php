<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCouponsTable extends Migration
{

    public function up()
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->text('name');
            $table->string('code')->index();
            $table->decimal('value', 18, 2)->unsigned()->nullable();
            $table->boolean('is_percent');
            $table->integer('usage_limit_per_coupon')->unsigned()->nullable();
            $table->integer('usage_limit_per_customer')->unsigned()->nullable();
            $table->integer('minimum_minutes')->unsigned()->nullable();
            $table->integer('used')->default(0);
            $table->boolean('is_active');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }


    public function down()
    {
        Schema::dropIfExists('coupons');
    }
}
