<?php


namespace App\Http\Controllers\AdminPanel\MailingList;

use App\Http\Controllers\AdminPanel\CoreController;

use App\Http\Resources\AdminPanel\MailingList\MailingListsResources;
use App\Models\MailingList;
use Illuminate\Http\Request;

class MailingListController extends CoreController
{

    use MailingListTrait;

    public function __construct(MailingList $mailingList)
    {
        $this->dirView = 'mailing-lists';
        $this->asRoute = 'mailingList';
        $this->route = 'mailing-lists';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($mailingList);
    }

    public function index()
    {
        $pageTitle = trans_admin('mailing_lists');
        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);
        $asRoute = $this->asRoute;
        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function data(Request $request)
    {
        $mailingList = new $this->model();

        $mailingList = $this->filter($request, $mailingList);

        $mailingList = $this->sort($request, $mailingList);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $mailingList = $mailingList->paginate($limit);

        $data = MailingListsResources::collection($mailingList);
        $meta = collect($mailingList)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);

    }


    public function destroy($id)
    {
        $email = $this->model::findOrFail($id);
        $delete = $email->delete();
        return $this->deleteResponse($delete);
    }
}
