<?php


namespace App\Http\Controllers\AdminPanel\Chat;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Models\UserMessage;

class ChatController extends CoreController
{
    public function __construct(UserMessage $userMessage)
    {
        $this->dirView = 'chats';
        $this->asRoute = 'chat';
        $this->route = 'chats';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($userMessage);
    }

    public function index()
    {

    }

    public function fetchMessages()
    {

    }

    public function store()
    {

    }

}
