<?php


namespace App\Http\Requests\App\Dashboard\Client;


use App\Models\RatingCriteria;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Cache;

class UserRatingRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
//        $totalCriterias = Cache::remember('group_criterias', CACHE_TTL, function () {
//            return RatingCriteria::whereHas('group', function ($q) {
//                $q->where('is_active', YES);
//            })->count();
//        });
        return [
            'comment' => 'required|string|max:5000',
            'criterias' => ['required', 'array'],
            'criterias.*.id' => 'integer|exists:rating_criterias,id',
        ];
    }

    public function attributes()
    {
        return [
            'criterias' => trans_app('criterias'),
            'comment' => trans_app('comment'),
        ];
    }
}
