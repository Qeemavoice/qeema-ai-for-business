<?php


namespace App\Http\Controllers\AdminPanel\MailMessage;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Resources\AdminPanel\MailMessage\MailMessagesResource;
use App\Models\MailMessage;
use Illuminate\Http\Request;

class MailMessageController extends CoreController
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

    public function index()
    {
        $pageTitle = trans_admin('mail_messages');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function create()
    {
        $pageTitle = trans_admin('add_mail_message');

        meta_data(trans_admin('mail_messages'), trans_admin('mail_messages'), [
            $this->routeUrl => trans_admin('mail_messages'),
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create', compact('pageTitle', 'asRoute'));
    }

    public function data(Request $request)
    {
        $rows = new $this->model();

        $rows = $this->filter($request, $rows);

        $rows = $this->sort($request, $rows);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;

        $rows = $rows->paginate($limit);

        $data = MailMessagesResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function destroy($id)
    {
        return $this->deleteResponse( $this->model::findOrFail($id)->delete());
    }

    public function changeType($id, Request $request)
    {

        $message = $this->model::findOrFail($id);
        $message->status = $request->type;
        $message->save();

        return $this->successResponse($message);
    }

//    public function changeTypeAll($id,Request $request)
//    {
//        $message = $this->model::findOrFail($id);
//        $message->status = $request->type;
//        $message->save();
//
//        return $this->successResponse($message);
//    }
//
//    public function destroyAll(Request $request){
//
//    }
}
