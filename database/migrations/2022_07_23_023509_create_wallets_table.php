<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWalletsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('account_id')->nullable()->comment('userId-slug-random(micro time)');

            $table->string('balance')->nullable()->default(0)->comment('Charged balance'); // الرصيد المشحون
            $table->string('withdrawal_balance')->nullable()->default(0)->comment('Withdrawn balance'); // الرصيد المسحوب
            $table->string('request_balance')->nullable()->default(0)->comment('Balance to be withdrawn'); //الرصيد المطلوب سحبه

            $table->string('withdrawal_profits')->nullable()->default(0)->comment('Withdrawn profits'); //الأرباح المسحوبة
            $table->string('request_profit')->nullable()->default(0)->comment('Profits to be withdrawn'); //الارباح المطلوب سحبها
            $table->string('profits')->default(0)->nullable()->comment('Withdrawal profits'); //الأرباح القابلة للسحب
            $table->string('hold_profits')->default(0)->nullable()->comment('Profits pending on completed services + ongoing + being transferred'); // الارباح المعلقة بالخدمات المنتهية + والجاري العمل + الجاري تحويلها
            $table->softDeletes();
            $table->timestamps();
            $table->foreign('user_id')->on('users')->references('id')->onDelete(ON_DELETE);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('wallets');
    }
}
