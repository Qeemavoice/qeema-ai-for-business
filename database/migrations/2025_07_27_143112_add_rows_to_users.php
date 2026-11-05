<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('completed_orders_count')->nullable()->after('last_login');
            $table->unsignedInteger('client_rating_count')->default(0)->after('completed_orders_count');
            $table->decimal('client_average_rating', 5, 2)->unsigned()->after('client_rating_count');
            $table->unsignedInteger('voice_actor_rating_count')->default(0)->after('client_average_rating');
            $table->decimal('voice_actor_average_rating', 5, 2)->unsigned()->after('voice_actor_rating_count');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'completed_orders_count',
                'client_rating_count',
                'client_average_rating',
                'voice_actor_rating_count',
                'voice_actor_average_rating',
            ]);
        });
    }
};
