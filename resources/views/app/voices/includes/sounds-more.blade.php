@if($voices && count($voices) > 0)
    @foreach($voices as $voice)
        <div class="col-sm-12 col-md-6 col-lg-4">
            <div class="sound-details">
                @if(user()&&user()->user_type_id === \App\Models\UserType::CLIENT)
                    <a href="javaScript:;" :id="'audio_favorite_icon_'+{{$voice->id}}" @click="addOrRemoveToFavorite({{$voice->id}})" style="{{$voice->favorite ? 'color:red' : ''}}" class="addToFavorite"><span> اضافة للمفضلة</span><i class="fa fa-heart"></i></a>
                @endif
                <div class="targetDiv">
                    <audio controlslist="nodownload" controls="true" @play="handlePlay(`{{$voice->id}}`)" src="{{$voice->audio_file_url}}" id="'voice_audio_'+{{$voice->id}}" class="ppbutton fa fa-play audio-class"></audio>
                </div>

                <div class="soundName">
                    <div class="row">
                        <div class="col-8"><span class="name">{{$voice->title}}</span></div>
                        <div class="col-4" style="text-align: left;"><span class="price">{{$voice->show_total_price}}/ دقيقة</span></div>
                    </div>
                </div>

                <div class="soundStatics">
                    <div class="row">
                        <div class="col-8"><span class="orders">{{$voice->number_of_orders}}  طلب</span></div>
                        <div class="col-4 ta-l">
                            <span class="likes" id="'audio_counter_like_'+{{$voice->id}}" counter="{{$voice->number_of_likes}}">{{$voice->number_of_likes}}</span>
                            @if(user()&&user()->user_type_id === \App\Models\UserType::CLIENT)
                                <a href="javascript:;" @click="updateLike({{$voice->id}})"><span class="like-icon"><i class="fas fa-heart black-color" id="'audio_like_icon_'+{{$voice->id}}"></i></span></a>
                            @else
                                <span class="like-icon"><i class="fas fa-heart black-color"></i></span>
                            @endif
                        </div>
                    </div>
                </div>
                <div class="soundType">
                    <div class="row">
                        <div class="col-8 ta-r">
                            <span class="sType">
                                {{isset($voice->dialect->language) ? $voice->dialect->language->name : '-'}},
                                {{isset($voice->dialect) ? $voice->dialect->name : '-'}},
                                {{isset($voice->category->category) ? $voice->category->category->name : '-'}},
                            </span>
                        </div>
                        <div class="col-4 ta-l">
                            <span class="likes" id="'counter_listens_'+{{$voice->id}}" counter="{{$voice->number_of_listened}}">{{$voice->number_of_listened}}</span>
                            <span class="listen-icon"><i class="fas fa-headphones-alt"></i></span>
                        </div>
                    </div>
                </div>
                <div class="reserve">
                    <div class="row">
                        <div class="col-12">
                            <a href="{{route_app('booking.index',['slug' => $voice->slug])}}">احجز الآن</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    @endforeach
@else
    <div v-else class="col-md-12 mt-4">
        <div class="alert alert-warning">لا توجد نتائج</div>
    </div>
@endif
