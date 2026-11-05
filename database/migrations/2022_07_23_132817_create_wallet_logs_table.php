<?php

use App\Models\WalletLogs;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWalletLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('wallet_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('wallet_id')->nullable();
            $table->unsignedBigInteger('transaction_id')->nullable();
            $table->morphs('sub_wallet');
            $table->softDeletes();
            $table->timestamps();
            $table->foreign('wallet_id')->on('wallets')->references('id')->onDelete(ON_DELETE);
            $table->foreign('transaction_id')->on('transactions')->references('id')->onDelete(ON_DELETE);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('wallet_logs');
    }
}
