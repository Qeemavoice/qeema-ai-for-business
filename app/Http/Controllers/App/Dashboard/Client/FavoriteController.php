<?php


namespace App\Http\Controllers\App\Dashboard\Client;


use App\Http\Controllers\App\CoreController;
use App\Http\Resources\App\Dashboard\Clients\FavoritesResources;
use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends CoreController
{
    public $model;

    public function __construct(Favorite $model)
    {
        $this->model = $model;
    }

    public function data(Request $request)
    {
        $favorites = new $this->model();

        $limit = $request->limit ? $request->limit : APP_PER_PAGE;
        $favorites = $favorites->where('user_id',user()->getAuthIdentifier())->paginate($limit);

        $data = FavoritesResources::collection($favorites);
        $meta = collect($data)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function store(Request $request)
    {
        $voiceId = $request->id;
        $userId = user()->id;

        $favorite = Favorite::where('user_id', $userId)->where('voice_id', $voiceId)->first();

        if ($favorite)
            $store = $favorite->delete();
        else
            $store = Favorite::create([
                'voice_id' => $voiceId,
                'user_id' => $userId,
            ]);

        return $this->response($store);
    }
}
