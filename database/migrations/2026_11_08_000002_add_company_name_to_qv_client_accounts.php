<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** «اسم الشركة» in the client's personal data (shown as the workspace name when set) */
class AddCompanyNameToQvClientAccounts extends Migration
{
    public function up()
    {
        Schema::table('qv_client_accounts', function (Blueprint $t) {
            $t->string('company_name', 120)->nullable()->after('country');
        });
    }

    public function down()
    {
        Schema::table('qv_client_accounts', function (Blueprint $t) {
            $t->dropColumn('company_name');
        });
    }
}
