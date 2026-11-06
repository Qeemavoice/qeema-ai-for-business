<?php


namespace App\Http\Controllers\App\Dashboard;


use App\Http\Controllers\App\CoreController;
use App\Http\Requests\App\Dashboard\Client\UserRatingRequest;
use App\Http\Resources\App\Dashboard\UserRatingDetailsResources;
use App\Models\Order;
use App\Models\OrderStatus;
use App\Models\UserRating;
use App\Models\UserType;
use App\Services\RatingHelper;
use App\Services\WalletHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeedbackController extends CoreController
{
    public function send(UserRatingRequest $request)
    {
        $store = DB::transaction(function () use ($request) {
            $user = user();
            $ratingHelper = new RatingHelper($request);

            $orderId = $request->order_id;

            if ($user->user_type_id === UserType::VOICE_ACTOR) {
                $ratingHelper->ratingVoiceActorToClient();

                $order = Order::where('voice_actor_id', user()->getAuthIdentifier())
                    ->where('status_id', OrderStatus::IN_PROGRESS)
                    ->findOrFail($orderId);

                $order->is_voice_actor_rated = YES;
            }

            if ($user->user_type_id === UserType::CLIENT) {

                $ratingHelper->ratingClientToVoiceActor();


                $order = Order::where('customer_id', user()->getAuthIdentifier())
                    ->where('status_id', OrderStatus::IN_PROGRESS)
                    ->findOrFail($orderId);

                $order->status_id = OrderStatus::COMPLETED;
                $order->is_client_rated = YES;

                WalletHelper::setExpectedReleaseDateHoldPayment($orderId);
            }

            $order->save();

            return $ratingHelper->userRating;
        });


        //todo :: send notify voice over complete order
        //todo :: send to admin

        return $this->successResponse($store);
    }

    public function details(Request $request)
    {
        $column = user()->user_type_id === UserType::CLIENT ? 'client_id' : 'voice_actor_id ';

        $userRating = UserRating::where('order_id', $request->orderId)
            ->where($column, user()->getAuthIdentifier())
            ->with('order.voiceItem.itemable')
            ->first();

        return $this->response(new UserRatingDetailsResources($userRating));
    }
}
