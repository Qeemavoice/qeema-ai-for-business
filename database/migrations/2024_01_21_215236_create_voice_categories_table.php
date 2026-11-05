<?php

use App\Models\Service;
use App\Models\Voice;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVoiceCategoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('voice_categories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('voice_id')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->foreign('voice_id')->references('id')->on('voices')->onDelete(ON_DELETE);
            $table->foreign('category_id')->references('id')->on('categories')->onDelete(ON_DELETE);

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('voice_categories');
    }
}
