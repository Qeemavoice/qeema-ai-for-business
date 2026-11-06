<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGuideDownloadsTable extends Migration
{

    public function up()
    {
        Schema::create('guide_downloads', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id')->nullable();
            $table->unsignedBigInteger('guide_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->timestamps();
            $table->foreign('order_id')->references('id')->on('orders')->onDelete(ON_DELETE);
            $table->foreign('guide_id')->references('id')->on('guides')->onDelete(ON_DELETE);
            $table->foreign('user_id')->references('id')->on('users')->onDelete(ON_DELETE);
        });
    }


    public function down()
    {
        Schema::dropIfExists('guide_comments');
    }
}
