<?php


namespace App\Jobs;

use App\Models\Message;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;

class SeenMessageJob implements ShouldQueue
{

   // private $request;
    private $userMessageId;
    //private $where;
    private $userID;

    public function __construct($userMessageId, $userID)
    {
        //$this->request = $request;
        $this->userMessageId = $userMessageId;
       // $this->where = $where;
        $this->userID = $userID;
    }

    public function handle()
    {
        //where('u_to_id', $this->request['u_to'])->
        //u_from_id

        Message::where('u_to_id',  $this->userID)
            ->whereNull('seen')
            ->where('user_message_id', $this->userMessageId)->update([
                'seen' => Carbon::now()
            ]);
    }
}