<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRatingCriteriasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('rating_criterias', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->text('name');
            $table->string('type')->nullable();
            $table->unsignedBigInteger('group_id');
            $table->softDeletes();
            $table->timestamps();
            $table->foreign('group_id')->on('rating_groups')->references('id')->onDelete(ON_DELETE);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('rating_criterias');
    }
}
