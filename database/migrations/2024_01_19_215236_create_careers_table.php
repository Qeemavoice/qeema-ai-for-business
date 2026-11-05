<?php

use App\Models\Career;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCareersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('careers', function (Blueprint $table) {
            $table->id();
            $table->text('title');
            $table->text('job_title');
            $table->text('experience');
            $table->text('responsibilities');
            $table->text('tasks');
            $table->integer('min_salary');
            $table->integer('max_salary');
            $table->string('external_image')->nullable();
            $table->string('interior_image')->nullable();
            $table->enum('status', [YES, NO])->nullable()->default(YES);
            $table->enum('workplace_type', [Career::WORKPLACE_TYPE_ON_SITE, Career::WORKPLACE_TYPE_REMOTE])->nullable()->comment(Career::WORKPLACE_TYPE_ON_SITE . ':on-site ' . Career::WORKPLACE_TYPE_REMOTE . ':remote');
            $table->enum('type', [Career::TYPE_FULL_TIME, Career::TYPE_PART_TIME])->nullable()->comment(Career::TYPE_FULL_TIME . ':full time ' . Career::TYPE_PART_TIME . ':part time');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('careers');
    }
}
