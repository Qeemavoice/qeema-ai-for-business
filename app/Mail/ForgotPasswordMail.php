<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ForgotPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    private $user;
    private $token;
    private $isAdmin;

    /**
     * Create a new message instance.
     *
     * @param User $user
     * @param $token
     */
    public function __construct(User $user, $token)
    {
        $this->user = $user;
        $this->token = $token;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('emails.forget_password', [
            'full_name' => $this->user->full_name,
            'token' => $this->token,
            'isAdmin' => request()->segment(1) == ADMIN_PREFIX
        ])->subject(trans_app('title_password_reset_request'));
    }
}
