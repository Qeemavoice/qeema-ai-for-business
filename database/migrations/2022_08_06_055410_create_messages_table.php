<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMessagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_message_id');
            $table->unsignedBigInteger('u_from_id');
            $table->unsignedBigInteger('u_to_id')->nullable();
            $table->longText('message');
            $table->timestamp('read_at')->nullable();
            $table->timestamp('seen')->nullable();
            $table->timestamps();
            $table->foreign('user_message_id')->on('user_messages')->references('id')->onDelete(ON_DELETE);
            $table->foreign('u_from_id')->on('users')->references('id')->onDelete(ON_DELETE);
            $table->foreign('u_to_id')->on('users')->references('id')->onDelete(ON_DELETE);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('messages');
    }
}
