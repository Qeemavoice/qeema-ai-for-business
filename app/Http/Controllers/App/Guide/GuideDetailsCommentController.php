<?php


namespace App\Http\Controllers\App\Guide;


use App\Http\Controllers\App\CoreController;
use App\Http\Requests\App\Guide\StoreGuideDetailsCommentRequest;
use App\Models\GuideComment;

class GuideDetailsCommentController extends CoreController
{
    protected $dirView;

    public function __construct()
    {
        $this->dirView = 'guides';
    }

    public function store(StoreGuideDetailsCommentRequest $request)
    {
        $store = GuideComment::create([
            'name' => $request->name,
            'email' => $request->email,
            'details' => $request->details,
            'guide_id' => $request->guide_id,
        ]);

        return $this->successResponse($store);
    }

    public function data()
    {
        $data = GuideComment::where('status', YES)
            ->orderBy('created_at', 'DESC')
            ->paginate(APP_PER_PAGE);

        return $this->response($data);
    }

}
