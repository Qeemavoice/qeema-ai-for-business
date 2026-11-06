<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddElevenlabsVoiceIdToVoicesTable extends Migration
{
    public function up()
    {
        Schema::table('voices', function (Blueprint $table) {
            $table->string('elevenlabs_voice_id')->nullable()->after('audio_file');
        });
    }

    public function down()
    {
        Schema::table('voices', function (Blueprint $table) {
            $table->dropColumn('elevenlabs_voice_id');
        });
    }
}
