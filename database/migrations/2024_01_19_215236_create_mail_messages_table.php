<?php

use App\Models\MailMessage;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMailMessagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('mail_messages', function (Blueprint $table) {
            $table->id();
            $table->text('from');
            $table->text('to');
            $table->text('cc')->nullable();
            $table->text('bcc')->nullable();
            $table->string('full_name')->nullable();
            $table->string('mobile')->nullable();
            $table->string('subject')->nullable();
            $table->longText('content');
            $table->enum('status', [MailMessage::MARKED_STATUS, MailMessage::DRAFT_STATUS])->nullable()->comment(MailMessage::MARKED_STATUS . ':Marked , ' . MailMessage::DRAFT_STATUS . ':Drafted');
            $table->enum('source', [MailMessage::CONTACT_US_FORM_SOURCE])->nullable()->comment(MailMessage::CONTACT_US_FORM_SOURCE . ':Contact Us Form');
            $table->boolean('is_send')->nullable();
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
        Schema::dropIfExists('mail_messages');
    }
}
