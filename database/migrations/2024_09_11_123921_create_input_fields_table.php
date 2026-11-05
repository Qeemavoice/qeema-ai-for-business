<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInputFieldsTable extends Migration
{

    public function up()
    {
        Schema::create('input_fields', function (Blueprint $table) {
            $table->id();
            $table->text('title')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('input_fields');
    }
}
