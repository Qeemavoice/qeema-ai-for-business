<?php

use App\Models\Guide;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGuidesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('guides', function (Blueprint $table) {
            $table->id();
            $table->text('name');
            $table->text('details');
            $table->string('image');
            $table->string('file');
            $table->decimal('unit_price', 18, 2)->unsigned()->nullable();
            $table->float('evaluation_rate')->nullable()->default(0.0);
            $table->enum('type', [Guide::TYPE_FREE, Guide::TYPE_PAID])
                ->nullable()
                ->default(Guide::TYPE_FREE)
                ->comment(Guide::TYPE_FREE . ': Free' . Guide::TYPE_PAID . ': Paid');
            $table->integer('number_of_likes')->nullable()->default(0);
            $table->integer('number_of_comments')->nullable()->default(0);
            $table->integer('number_of_downloads')->nullable()->default(0);
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
        Schema::dropIfExists('guides');
    }
}
