<?php

namespace App\Http\Controllers\App\Dashboard\Chat;

use App\Events\MessageSend;
use App\Http\Controllers\App\CoreController;
use App\Http\Resources\Messages\MessagesResource;
use App\Jobs\SeenMessageJob;
use App\Models\Message;
use App\Models\Order;
use App\Models\UserMessage;
use App\Models\Voice;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ChatController extends CoreController
{
    use ChatTrait;

    protected $dirView;

    public function __construct()
    {
        $this->dirView = 'dashboard.chat';
    }

    public function index(Request $request)
    {
        $t = $request->t;

        if (!$t)
            return redirectToBack();

        meta_data(trans_app('chat'), null, [
            '#' => trans_app('chat'),
        ]);

        $userMessage = null;
        $order = null;
        $servicesItems = null;
        $voiceItem = null;
        $fromUser = null;
        $toUser = null;

        if ($t) {
            try {
                $t = decrypt($t);
            } catch (\RuntimeException $e) {
                dd($e->getMessage());
            }
            $userMessage = UserMessage::with('fromUser',
                'order.items.details.category',
                'order.items.details.language',
                'order.items.details.dialect',
                'order.items.details.voiceType',
               // 'order.items.itemable'
            )->where('order_id', $t)->firstOrFail();

            $order = $userMessage->order;
            $isClientRated = $order->is_client_rated;

            $voiceItem = $order->items->where('itemable_type', '==', Voice::class)->first();

            $servicesItems = $order->items->where('itemable_type', '!=', Voice::class)->all();


            $fromUser = user()->getAuthIdentifier();

            if (user()->getAuthIdentifier() == $order->voice_actor_id) {
                $toUser = $order->customer_id;
            } else {
                $toUser = $order->voice_actor_id;
            }

        }

        return view(APP_VIEWS_DIR . '.' . $this->dirView . '.index',
            compact(
                'userMessage',
                'order',
                'servicesItems',
                'voiceItem',
                'fromUser',
                'toUser',
                'isClientRated'
            )
        );
    }

    public function fetchMessages(Request $request)
    {
        $orderId = $request->orderId;
        $userMessageId = $request->userMessageId;

        $order = Order::findOrFail($orderId);

        $userFromId = user()->id;

        if (user()->id == $order->voice_actor_id) {
            $userToId = $order->customer_id;
        } else {
            $userToId = $order->voice_actor_id;
        }

        $messages = Message::whereHas('userMessage', function ($q) use ($userMessageId, $orderId, $userFromId, $userToId) {
            $q->where(function ($q) use ($userToId, $userFromId) {
                $q->where(function ($q) use ($userToId, $userFromId) {
                    $q->where('u_from_id', $userToId);
                    $q->where('u_to_id', $userFromId);
                });
                $q->orWhere(function ($q) use ($userToId, $userFromId) {
                    $q->where('u_from_id', $userFromId);
                    $q->where('u_to_id', $userToId);
                });
            })->where('order_id', $orderId);
        })->where('user_message_id', $userMessageId)
            ->orderBy('created_at', 'desc')->with(['fromUser', 'toUser'])
            ->paginate(APP_PER_PAGE);

        $data = MessagesResource::collection($messages);
        $meta = collect($messages)->except('data');

//        if ($request->seen)
//            dispatch(new SeenMessageJob($userMessageId, user()->id));

        return $this->response([
            'data' => $data,
            'meta' => $meta,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'contentMessage' => 'string|max:5000',
            'orderId' => 'required',
        ]);

        $orderId = $request->orderId;

        $order = Order::findOrFail($orderId);

        $userToId = user()->id == $order->voice_actor_id ? $order->customer_id : $order->voice_actor_id;

        $userMessage = UserMessage::where('order_id', $orderId)
            ->where(function ($q) use ($userToId) {
                $q->Where(function ($q) use ($userToId) {
                    $q->where('u_from_id', $userToId);
                    $q->where('u_to_id', user()->id);
                });
                $q->orWhere(function ($q) use ($userToId) {
                    $q->where('u_from_id', user()->id);
                    $q->where('u_to_id', $userToId);
                });
            })
            ->firstOrFail();


        $userMessage->updated_at = Carbon::now();
        $userMessage->save();

        $message = new Message();
        $message->user_message_id = $userMessage->id;
        $message->message = $request->contentMessage;
        $message->u_from_id = user()->id;
        $message->u_to_id = $userToId;
        $message->save();

        broadcast(new MessageSend($message, $orderId, $userMessage));
//        Notification::send($message->toUser, new SendMessageNotification($message, $userMessage));

        $msg = $message ? trans('messages.send_message_susses') : trans('messages.send_message_error');
        return $this->response($message, null, $msg);
    }
}
