<?php

namespace App\Http\Controllers\AdminPanel\VoiceActor;

use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Requests\AdminPanel\VoiceActor\StoreVoiceActorRequest;
use App\Http\Resources\AdminPanel\VoiceActor\VoiceActorResource;
use App\Http\Resources\AdminPanel\VoiceActor\VoiceActorResources;
use App\Models\Country;
use App\Models\Language;
use App\Models\PaymentMethod;
use App\Models\User;
use App\Models\UserLanguage;
use App\Models\UserPaymentMethod;
use App\Models\UserProfile;
use App\Models\UserType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VoiceActorController extends CoreController
{
    use VoiceActorTrait;

    public function __construct(User $voiceActor)
    {
        $this->dirView = 'voice-actors';
        $this->asRoute = 'voiceActor';
        $this->route = 'voice-actors';
        $this->routeUrl = route_admin($this->asRoute . '.index');

        parent::__construct($voiceActor);
    }


    public function index()
    {
        $pageTitle = trans_admin('voice_actors');

        meta_data($pageTitle, $pageTitle, [
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.index', compact('pageTitle', 'asRoute'));
    }

    public function create()
    {
        $pageTitle = trans_admin('add_voice_actor');

        meta_data(trans_admin('voice_actors'), trans_admin('voice_actors'), [
            $this->routeUrl => trans_admin('voice_actors'),
            '' => $pageTitle
        ]);

        $asRoute = $this->asRoute;
        $languages = Language::getLanguages();
        $countries = Country::getCountries();
        $paymentMethods = PaymentMethod::getPaymentMethods();

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create',
            compact('pageTitle', 'languages', 'asRoute', 'countries', 'paymentMethods')
        );
    }

    public function data(Request $request)
    {
        $rows = new $this->model();

        $rows = $this->filter($request, $rows);

        $rows = $this->sort($request, $rows);

        $limit = $request->limit ? $request->limit : ADMIN_PER_PAGE;
        $rows = $rows->userTypeVoiceActor()->paginate($limit);

        $data = VoiceActorResources::collection($rows);
        $meta = collect($rows)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function edit($id)
    {
        $voiceActor = new VoiceActorResource($this->model::with('profile.country')->findOrFail($id));

        $pageTitle = trans_admin('edit_voice_actor');

        meta_data(trans_admin('voices'), trans_admin('voice_actors'), [
            $this->routeUrl => trans_admin('voice_actors'),
            '' => $pageTitle
        ]);

        $languages = Language::getLanguages();
        $countries = Country::getCountries();
        $paymentMethods = PaymentMethod::getPaymentMethods();

        return view(ADMIN_VIEWS_DIR . '.' . $this->dirView . '.create',
            compact('pageTitle', 'languages', 'voiceActor', 'countries', 'paymentMethods')
        );
    }


    public function store(StoreVoiceActorRequest $request)
    {
        $store = DB::transaction(function () use ($request) {

            $id = $request->id;

            if ($id) {
                $store = $this->model::findOrFail($id);
            } else {
                $store = new $this->model();
            }

            $store->full_name = $request->full_name;
            $store->email = $request->email;
            $store->mobile = $request->mobile;
            $store->uniq_id = generate_uniq_id();
            $store->user_type_id = UserType::VOICE_ACTOR;
            $store->save();


            UserProfile::updateOrCreate([
                'user_id' => $store->id,
            ], [
                'country_id' => $request->country,
                'price_per_minute' => $request->price_per_minute,
            ]);


            UserLanguage::sync($request->languageIds, $store->id);

            UserPaymentMethod::sync([$request->payment_method], $store->id);

            return $store;
        });

        return $this->successResponse($store);
    }

    public function destroy($id)
    {
        return $this->deleteResponse($this->model::findOrFail($id)->delete());
    }

    public function search(Request $request)
    {
        $filter = $request->input('query');

        $model = User::query();

        $data = [];


        if ($filter) {

            $data = $model->where(function ($query) use ($filter) {
                $text = strtolower($filter);
                $query->whereRaw("JSON_VALID(full_name) AND LOWER(JSON_UNQUOTE(JSON_EXTRACT(full_name, '$.en'))) LIKE ?", ["%$text%"])
                    ->orWhereRaw("JSON_VALID(full_name) AND JSON_UNQUOTE(JSON_EXTRACT(full_name, '$.ar')) LIKE ?", ["%$text%"])
                    ->orWhereRaw("NOT JSON_VALID(full_name) AND full_name LIKE ?", ["%$text%"]);
                $query->orwhere('email', 'LIKE', "%$filter%");
            });

            $data = $data->userTypeVoiceActor()->get();
        }


        return $this->response([
            'data' => $data,
        ]);
    }
}
