<?php


namespace App\Http\Controllers\App\Dashboard;


use App\Http\Controllers\App\CoreController;
use App\Http\Resources\App\Dashboard\RatingCriteria\RatingCriteriaResources;
use App\Models\RatingCriteria;
use Illuminate\Support\Facades\Cache;

class RatingController extends CoreController
{

    public function getCriterias()
    {
        $criterias = Cache::remember('group_criterias', CACHE_TTL, function () {
            return RatingCriteria::whereHas('group', function ($q) {
                $q->where('is_active', YES);
            })->get();
        });

        $data = RatingCriteriaResources::collection($criterias);
        return $this->response($data);
    }
}
