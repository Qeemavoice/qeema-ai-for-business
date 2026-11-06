<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUserMessagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_messages', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('u_from_id');
            $table->unsignedBigInteger('u_to_id')->nullable();
            $table->unsignedBigInteger('order_id')->nullable();
            $table->enum('is_admin', [YES, NO])->nullable();
            $table->timestamp('is_send_email')->nullable();
            $table->timestamps();
            $table->foreign('u_from_id')->on('users')->references('id')->onDelete(ON_DELETE);
            $table->foreign('u_to_id')->on('users')->references('id')->onDelete(ON_DELETE);
            $table->foreign('order_id')->on('orders')->references('id')->onDelete(ON_DELETE);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_messages');
    }
}
