<?php

use App\Models\ArticleStatus;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateArticlesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->text('title');
            $table->text('short_description');
            $table->string('external_image')->nullable();
            $table->string('internal_image')->nullable();
            $table->text('content');
            $table->text('meta_description')->nullable();
            $table->text('meta_keywords')->nullable();
            $table->text('video_url')->nullable();
            $table->integer('read_count')->default(0)->nullable();
            $table->enum('status', [
                ArticleStatus::DRAFT,
                ArticleStatus::PUBLISHED,
                ArticleStatus::UN_PUBLISHED,
                ArticleStatus::SCHEDULED
            ])->nullable()->default(ArticleStatus::DRAFT);
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
        Schema::dropIfExists('articles');
    }
}
