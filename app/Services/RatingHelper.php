<?php

namespace App\Services;

use App\Models\UserRating;
use Carbon\Carbon;

class RatingHelper
{
    public $userRating;
    public $orderId;
    public $groupId;
    public $comment;
    public $criterias;
    public $average;
    public $user;

    public function __construct($request)
    {
        $this->request = $request;
        $this->orderId = $this->request->order_id;
        $this->groupId = $this->request->group_id;
        $this->comment = $this->request->comment;
        $this->criterias = $this->request->criterias;
        $this->user = user();

        try {
            $this->calculateAvarage();
        } catch (\Exception $e) {
        }

        $this->userRating = UserRating::where('order_id', $this->orderId)->first();

        if (!$this->userRating)
            $this->userRating = new UserRating();

        $this->userRating->group_id = $this->groupId;
        $this->userRating->order_id = $this->orderId;
    }

    public function ratingClientToVoiceActor()
    {
        $criterias = $this->criterias ?? [];

        $this->userRating->client_id = $this->user->getAuthIdentifier();
        $this->userRating->client_response = $this->comment;
        $this->userRating->client_rated_at = Carbon::now()->toDateTimeString();
        $this->userRating->client_criterias = json_encode($criterias);
        $this->userRating->client_average = $this->average;
        $this->userRating->save();

        $this->calculateAvarageRatingVoiceActor();
    }

    public function ratingVoiceActorToClient()
    {
        $this->userRating->voice_actor_id = $this->user->getAuthIdentifier();
        $this->userRating->voice_actor_response = $this->comment;
        $this->userRating->voice_actor_rated_at = Carbon::now()->toDateTimeString();
        $this->userRating->voice_actor_criterias = json_encode($this->criterias);
        $this->userRating->voice_actor_average = $this->average;
        $this->userRating->save();

        $this->calculateAvarageRatingClient();
    }

    public function calculateAvarage()
    {
        $criteriaValues = array_column($this->criterias, 'value');

        if (empty($criteriaValues)) {
            throw new \Exception('No valid criteria provided.');
        }

        $this->average = round(array_sum($criteriaValues) / count($criteriaValues), 1);
    }

    public function calculateAvarageRatingClient()
    {
        $ratingCount = $this->user->client_rating_count + 1;

        if ($this->user->client_rating_count == 0 || is_null($this->user->client_rating_count))
            $averageRate = $this->average;
        else
            $averageRate = ($this->average + $this->user->client_average) / 2;

        $this->user->client_rating_count = $ratingCount;
        $this->user->client_average = $averageRate;
        $this->user->completed_orders_count = $this->user->completed_orders_count + 1;
        $this->user->save();
    }

    public function calculateAvarageRatingVoiceActor()
    {
        $ratingCount = $this->user->voice_actor_rating_count + 1;

        if ($this->user->voice_actor_rating_count == 0 || is_null($this->user->voice_actor_rating_count))
            $averageRate = $this->average;
        else
            $averageRate = ($this->average + $this->user->voice_actor_average) / 2;

        $this->user->voice_actor_rating_count = $ratingCount;
        $this->user->voice_actor_average = $averageRate;
        $this->user->completed_orders_count = $this->user->completed_orders_count + 1;
        $this->user->save();
    }
}
