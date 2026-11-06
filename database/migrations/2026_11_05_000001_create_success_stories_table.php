<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSuccessStoriesTable extends Migration
{
    public function up()
    {
        Schema::create('success_stories', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('brand');
            $table->string('brand_en')->nullable();
            $table->string('brand_color', 32)->nullable();
            $table->text('about')->nullable();
            $table->string('voice_category')->nullable()->index();
            $table->string('industry')->nullable()->index();
            $table->string('title');
            $table->string('title_en')->nullable();
            $table->string('story_date')->nullable();
            $table->string('audio_url', 2048)->nullable();
            $table->unsignedInteger('audio_duration_secs')->nullable();
            $table->string('audio_duration', 32)->nullable();
            $table->text('hero_subtitle')->nullable();
            $table->json('stats')->nullable();
            $table->json('paragraphs')->nullable();
            $table->json('highlights')->nullable();
            $table->json('clips')->nullable();
            $table->text('content')->nullable();
            $table->text('quote_text')->nullable();
            $table->string('quote_author')->nullable();
            $table->string('quote_role')->nullable();
            $table->string('image_accent')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(false)->index();
            $table->boolean('permission_confirmed')->default(false);
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->string('source_url', 2048)->nullable();
            $table->timestamp('imported_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('success_stories');
    }
}
