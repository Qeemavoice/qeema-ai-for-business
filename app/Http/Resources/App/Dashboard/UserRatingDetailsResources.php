<?php


namespace App\Http\Resources\App\Dashboard;

use App\Models\RatingCriteria;
use Illuminate\Http\Resources\Json\JsonResource;

class UserRatingDetailsResources extends JsonResource
{
    public function toArray($request)
    {
        $array['id'] = $this->id;
        $array['audio_file_url'] = $this->order->voiceItem->itemable->audio_file_url;
        $array['voice_id'] = $this->order->voiceItem->itemable_id;

        $array['response'] = $this->client_response;

        $criterias = collect(json_decode($this->client_criterias));
        $ids = $criterias->map(fn($item) => $item->id)->all();

        $criteriasItem = RatingCriteria::whereIn('id',$ids)->get()->keyBy('id');

        $updated = $criterias->map(function ($item) use ($criteriasItem) {
            $item->criteria = $criteriasItem[$item->id] ?? null;
            unset($item->id);
            return $item;
        });

        $array['criterias'] = $updated;
        $array['average'] = $this->client_average;

//        if ($this->client_id === user()->getAuthIdentifier()) {
//
//            $array['response'] = $this->client_response;
//
//            $criterias = collect(json_decode($this->client_criterias));
//            $ids = $criterias->map(fn($item) => $item->id)->all();
//
//            $criteriasItem = RatingCriteria::whereIn('id',$ids)->get()->keyBy('id');
//
//            $updated = $criterias->map(function ($item) use ($criteriasItem) {
//                $item->criteria = $criteriasItem[$item->id] ?? null;
//                unset($item->id);
//                return $item;
//            });
//
//            $array['criterias'] = $updated;
//            $array['average'] = $this->client_average;
//        }
//
//        if ($this->voice_actor_id === user()->getAuthIdentifier()) {
//            $array['response'] = $this->client_response;
//
//
//            $criterias = collect(json_decode($this->client_criterias));
//            $ids = $criterias->map(fn($item) => $item->id)->all();
//
//            $criteriasItem = RatingCriteria::whereIn('id',$ids)->get()->keyBy('id');
//
//            $updated = $criterias->map(function ($item) use ($criteriasItem) {
//                $item->criteria = $criteriasItem[$item->id] ?? null;
//                unset($item->id);
//                return $item;
//            });
//
//            $array['criterias'] = $updated;
//
//            $array['average'] = $this->client_average;
//        }

        return $array;
    }
}
