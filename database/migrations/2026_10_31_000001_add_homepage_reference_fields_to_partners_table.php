<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddHomepageReferenceFieldsToPartnersTable extends Migration
{
    public function up()
    {
        Schema::table('partners', function (Blueprint $table) {
            $table->string('reference_url', 2048)->nullable();
            $table->boolean('show_on_homepage')->default(false);
            $table->boolean('permission_confirmed')->default(false);
        });
    }

    public function down()
    {
        Schema::table('partners', function (Blueprint $table) {
            $table->dropColumn(['reference_url', 'show_on_homepage', 'permission_confirmed']);
        });
    }
}
