<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUserRatingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_ratings', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('voice_actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('group_id')->nullable()->constrained('rating_groups')->nullOnDelete();

            $table->text('voice_actor_response')->nullable();
            $table->text('client_response')->nullable();

            $table->json('voice_actor_criterias')->nullable(); // تصحيح التهجئة
            $table->json('client_criterias')->nullable();

            $table->decimal('voice_actor_average', 5, 2)->nullable();
            $table->decimal('client_average', 5, 2)->nullable();

            $table->timestamp('client_rated_at')->nullable();
            $table->timestamp('voice_actor_rated_at')->nullable();
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
        Schema::dropIfExists('user_ratings');
    }
}
