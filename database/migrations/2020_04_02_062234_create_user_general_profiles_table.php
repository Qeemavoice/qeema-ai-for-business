<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserGeneralProfilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_profile', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('country_id')->nullable();
            $table->unsignedBigInteger('gender_id')->nullable();
            $table->decimal('price_per_minute', 18, 2)->unsigned()->nullable();
            $table->decimal('price_per_hours', 18, 2)->unsigned()->nullable();
            $table->text('business_link')->nullable();
            $table->string('whatsapp_number')->nullable();
            $table->string('work_field')->nullable();
            $table->string('state')->nullable();
            $table->string('city')->nullable();
            $table->string('street')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('address1')->nullable();
            $table->string('address2')->nullable();
            $table->timestamps();
            $table->foreign('user_id')->on('users')->references('id')->onDelete(ON_DELETE);
            $table->foreign('country_id')->on('countries')->references('id')->onDelete(ON_DELETE);
            $table->foreign('gender_id')->on('genders')->references('id')->onDelete(ON_DELETE);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_general_profiles');
    }
}
