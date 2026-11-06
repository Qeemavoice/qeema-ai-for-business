<?php


namespace App\Http\Controllers\AdminPanel\MailMessage;

use App\Http\Controllers\AdminPanel\CoreController;
use App\Models\MailMessage;

class MailMessageDetailsController extends CoreController
{
    use MailMessageTrait;

    public function __construct(MailMessage $message)
    {
        $this->dirView = 'mail-messages';
        $this->asRoute = 'mailMessage';
        $this->route = 'mail-messages';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($message);
    }

    public function index($id)
    {
        $pageTitle = trans_admin('view_message');

        meta_data(trans_admin('mail_messages'), trans_admin('mail_messages'), [
            $this->routeUrl => trans_admin('mail_messages'),
            '' => $pageTitle
        ]);


        $asRoute = $this->asRoute;
        $message = $this->model::findOrFail($id);
        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.details', compact('pageTitle', 'asRoute','message'));
    }
}
