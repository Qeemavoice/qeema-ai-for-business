<?php

use App\Models\Service;
use App\Models\Voice;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserSamplesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_samples', function (Blueprint $table) {
            $table->id();
            $table->text('name');
            $table->string('file');
            $table->decimal('price_per_minute', 18, 2)->unsigned()->nullable();
            $table->unsignedBigInteger('language_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->unsignedBigInteger('dialect_id')->nullable();
            $table->enum('status', [YES, NO, PENDING])->nullable()->comment(YES . ':Accept ,' . NO . ' : Reject ,' . PENDING . ' : .' . 'Pending');
            $table->softDeletes();
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete(ON_DELETE);
            $table->foreign('language_id')->references('id')->on('languages')->onDelete(ON_DELETE);
            $table->foreign('category_id')->references('id')->on('categories')->onDelete(ON_DELETE);
            $table->foreign('dialect_id')->references('id')->on('dialects')->onDelete(ON_DELETE);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_samples');
    }
}
