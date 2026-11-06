<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGuideCommentsTable extends Migration
{

    public function up()
    {
        Schema::create('guide_comments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->text('details');
            $table->enum('status', [YES, NO, PENDING])->nullable()
                ->default(PENDING)
                ->comment(YES . ':Accept ,' . NO . ' : Reject ,' . PENDING . ' : .' . 'Pending');
            $table->unsignedBigInteger('guide_id')->nullable();
            $table->timestamps();
            $table->foreign('guide_id')->references('id')->on('guides')->onDelete(ON_DELETE);
        });
    }


    public function down()
    {
        Schema::dropIfExists('guide_comments');
    }
}
