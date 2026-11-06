<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('email')->unique()->nullable();
            $table->string('password')->nullable();
            $table->string('mobile')->nullable();
            $table->string('image')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('mobile_verified_at')->nullable();
            $table->string('uniq_id')->nullable();
            $table->dateTime('last_login')->nullable();
            $table->unsignedBigInteger('user_type_id')->nullable();
            $table->unsignedBigInteger('status_id')->nullable();
            $table->rememberToken();
            $table->softDeletes();
            $table->timestamps();
            $table->foreign('user_type_id')->references('id')->on('user_types')->onDelete(ON_DELETE);
            $table->foreign('status_id')->references('id')->on('user_statuses')->onDelete(ON_DELETE);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
