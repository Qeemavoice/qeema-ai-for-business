<?php

use App\Models\Service;
use App\Models\Voice;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVoicesTable extends Migration
{

    public function up()
    {
        Schema::create('voices', function (Blueprint $table) {
            $table->id();
            $table->text('title');
            $table->float('price_per_minute');
            $table->float('total_price');
            $table->integer('number_of_orders')->nullable()->default(0);
            $table->integer('number_of_listened')->nullable()->default(0);
            $table->integer('number_of_likes')->nullable()->default(0);
            $table->unsignedBigInteger('voiceover_id')->nullable();
            $table->unsignedBigInteger('language_id')->nullable();
            $table->unsignedBigInteger('dialect_id')->nullable();
            $table->unsignedBigInteger('voice_type_id')->nullable();
            $table->string('audio_file')->nullable();
            $table->text('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->boolean('is_sample')->nullable();
            $table->unsignedBigInteger('voice_status_id')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->foreign('voiceover_id')->references('id')->on('users')->onDelete(ON_DELETE);
            $table->foreign('dialect_id')->references('id')->on('dialects')->onDelete(ON_DELETE);
            $table->foreign('language_id')->references('id')->on('languages')->onDelete(ON_DELETE);
            $table->foreign('voice_type_id')->references('id')->on('voice_types')->onDelete(ON_DELETE);
            $table->foreign('voice_status_id')->references('id')->on('voice_statuses')->onDelete(ON_DELETE);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('voices');
    }
}
