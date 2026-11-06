<?php


namespace App\Http\Controllers\App\Guide;


use App\Http\Controllers\App\CoreController;
use App\Models\Guide;
use App\Services\CurrencyHelper;
use App\Services\Payment\Gateways\StripePayment;
use Illuminate\Http\Request;

class GuideDetailsController extends CoreController
{
    protected $dirView;

    public function __construct()
    {
        $this->dirView = 'guides';
    }

    public function index($slug)
    {
        $guide = Guide::findOrFail(explode('-', $slug)[0]);

        meta_data($guide->name, null, [
            route_app('guide.index') => trans_app('guides'),
            '#' => $guide->name,
        ]);
        $currency = CurrencyHelper::getSymbol();
        $keyStripe = StripePayment::config('key_id');
        $commissions = commissions();
        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.details',
            compact('guide', 'commissions', 'currency', 'keyStripe')
        );
    }


    public function download()
    {

    }

    public function storeLike(Request $request)
    {
        $guide = Guide::findOrFail($request->guide_id);
        $guide->number_of_likes = $guide->number_of_likes + 1;
        $guide->save();

        return $this->response(['number_of_likes' => $guide->number_of_likes]);
    }
}
