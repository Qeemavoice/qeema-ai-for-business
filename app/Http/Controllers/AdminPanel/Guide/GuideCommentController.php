<?php


namespace App\Http\Controllers\AdminPanel\Guide;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Resources\AdminPanel\Guide\GuidesCommentsResource;
use App\Models\GuideComment;
use Illuminate\Http\Request;

class GuideCommentController extends CoreController
{
    use GuideCommentTrait;

    public function __construct(GuideComment $guide)
    {
        $this->dirView = 'guides';
        $this->asRoute = 'guide';
        $this->route = 'guides';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($guide);
    }

    public function data($id, Request $request)
    {
        $rows = new $this->model();

        $rows = $this->filter($request, $rows);

        $rows = $this->sort($request, $rows);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $rows = $rows->paginate($limit);

        $data = GuidesCommentsResource::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function changeStatus($guideId, Request $request)
    {
        $comment = $this->model::findOrFail($request->id);

        $comment->status = $comment->status == YES ? NO : YES;
        $comment->save();
        return $this->successResponse($comment);
    }
}
