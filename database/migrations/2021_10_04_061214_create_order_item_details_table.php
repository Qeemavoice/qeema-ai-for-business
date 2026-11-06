<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOrderItemDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('order_item_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('item_id')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->unsignedBigInteger('language_id')->nullable();
            $table->unsignedBigInteger('dialect_id')->nullable();
            $table->unsignedBigInteger('voice_type_id')->nullable();
            $table->text('voice_audio_file')->nullable();
            $table->text('notes')->nullable();
            $table->integer('word_count')->nullable();
            $table->decimal('number_of_minutes', 18, 2)->unsigned();
//            $table->decimal('price_per_minute', 18, 2)->unsigned();
            $table->timestamps();
            $table->foreign('item_id')->references('id')->on('order_items')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            $table->foreign('language_id')->references('id')->on('languages')->onDelete('cascade');
            $table->foreign('dialect_id')->references('id')->on('dialects')->onDelete('cascade');
            $table->foreign('voice_type_id')->references('id')->on('voice_types')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('order_item_details');
    }
}
