<?php


namespace App\Http\Controllers\App;


use App\Http\Requests\App\NewsLetter\NewsLetterStoreRequest;
use App\Models\MailingList;

class SubscribeNewsLetterController extends CoreController
{
    public function __invoke(NewsLetterStoreRequest $request)
    {
        return $this->successResponse(MailingList::create(['email' => $request->email]));
    }
}
