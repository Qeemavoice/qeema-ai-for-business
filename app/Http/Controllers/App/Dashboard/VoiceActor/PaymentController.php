<?php


namespace App\Http\Controllers\App\Dashboard\VoiceActor;

use App\Http\Controllers\App\CoreController;
use App\Http\Resources\App\Dashboard\VoiceActors\ProfitsPaymentsResourceResources;
use App\Models\ProfitPayment;
use Illuminate\Http\Request;

class PaymentController extends CoreController
{
    protected $dirView;

    public function __construct()
    {
        $this->dirView = 'dashboard.voice-actors';
    }

    public function data(Request $request)
    {
        $holds = new ProfitPayment();

        $profits = $holds->whereHas('wallet', function ($q) {
            $q->where('user_id', user()->id);
        })->with('transaction.order')
            ->orderBy('release_date', 'desc')
            ->paginate(APP_PER_PAGE);

        $data = ProfitsPaymentsResourceResources::collection($profits);
        $meta = collect($data)->except('data');

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

}
