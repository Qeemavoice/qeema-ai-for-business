<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFormFieldsTable extends Migration
{

    public function up()
    {
        Schema::create('form_fields', function (Blueprint $table) {
            $table->id();
            $table->text('label')->nullable();
            $table->unsignedBigInteger('form_id');
            $table->unsignedBigInteger('input_field_id');
            $table->json('options')->nullable();
            $table->timestamps();
            $table->foreign('form_id')->references('id')->on('forms')->onDelete('cascade');
            $table->foreign('input_field_id')->references('id')->on('input_fields')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('form_fields');
    }
}
