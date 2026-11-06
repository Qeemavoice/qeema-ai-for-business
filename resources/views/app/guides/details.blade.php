@extends('app.layouts.app')

@push('page-title',meta('page-title'))


@section('content')
    <div class="container blog-page">
        @include('app.layouts.includes.nav')
        @include('app.layouts.includes.breadcrumbs')
        <guide-details-index :guide="{{json_encode($guide)}}"
                             :show-modal-payment-purchase="`{{request('showModalPaymentPurchase')}}`"
                             inline-template>

            <div>
                <div class="row mb-4">
                    <div class="col-md-5">
                        <div class="book-image">
                            <img data-name="product_image" id="main_image" class="border-radius-5" src="{{$guide->image_url}}" style="width: 100%; border-radius:5px;object-fit:cover" alt="{{$guide->name}}">
                        </div>
                        <div class="row mt-3">
                            <div class="col-md-12 text-center">
                                <ul id="divButtons" class="">
                                    <li><span style="font-weight:bold ">شارك عبر :</span></li>
                                    <li><a href="https://www.facebook.com/sharer?app_id=&amp;u={{URL::to('/')}}/guides/{{$guide->id}}&amp;redirect_uri={{URL::to('/')}}&amp;display=popup" class="facebook" onclick="javascript:window.open(this.href,'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=500,width=500');return false;"><i class="fab fa-facebook-f"></i><span> فيس بوك </span></a></li>
                                    <li><a href="https://twitter.com/share?url={{URL::to('/')}}/guides/{{$guide->id}}&amp;hashtags=قيمة,qeem" class="twitter" onclick="javascript:window.open(this.href,'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=500,width=500');return false;"><i class="fab fa-twitter"></i><span> تويتر</span></a></li>
                                    <li><a href="whatsapp://send?text={{$guide->name}}:: {{URL::to('/')}}/guides/{{$guide->id}}" class="google" onclick="javascript:window.open(this.href,'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=500,width=500');return false;"><i class="fab fa-whatsapp"></i><span> واتس أب</span></a></li>
                                </ul>
                            </div>
                        </div>
                        <div class="text-center mt-3 mb-4">
                            @if(!user())
                                <a href="javascript:;"
                                   @click="showLogin"
                                   class="btn btn-warning btn_login"><i class="fa fa-lock"></i>قم بتسجيل الدخول للتحميل </a>
                            @else
                                @if($guide->type == 1)
                                    <form target="_blank" action="{{route_app('guide.details.download')}}" method="post">
                                        @csrf
                                        <input type="hidden" name="id" value="{{$guide->id}}">
                                        <button type="submit" class="btn btn-warning"><i class="fa fa-upload"></i> اضغط للتحميل</button>
                                    </form>
                                @else
                                    <button type="button"  @click="payment" id="stripe" data-id="{{$guide->id}}" data-price="{{$guide->unit_price}}" class="btn btn-warning"><i class="fa fa-upload"></i> اضغط للشراء</button>
                                @endif
                            @endif
                        </div>
                    </div>
                    <div class="col-md-7">
                        <div class="">
                            <h1 class="text-right font26 text-dark font-weight-bold">{{$guide->name}}</h1>
                        </div>
                        <div class="guide-details" style="font-size:16px;text-align:justify">
                            {{$guide->details}}
                        </div>
                        <div class="d-flex justify-content-between  mt-4">
                            <p class=" main_color text-center mb-2" style="color: #000 !important"><span style="font-weight:bold">عدد التنزيلات  : {{$guide->number_of_downloads}}</span></p>
                            <p class=" main_color text-center mb-2" style="color: #000 !important"><span style="font-weight:bold ">السعر   : {{$guide->unit_price}}$</span></p>

                            @if($guide->rating)
                                <div class="text-center">
                                    <span style="font-weight:bold ">التقييم : </span>
                                    @for($i=1;$i<=$guide->evaluation_rate;$i++)
                                        <i class="fa fa-star" style="color:#FEA107 !important"></i>
                                    @endfor
                                </div>
                            @endif
                        </div>


                        <div class="d-flex justify-content-between  mt-4">
                            <div class="text-center">
                                <span style="font-weight:bold ">عدد الإعجابات  : <span class="likes_no" id="number_of_likes"> {{$guide->number_of_likes}}</span> </span>
                            </div>
                            <a href="javascript:;" :disabled="form.disabledButtonLike" @click="doLike" class="addLike" data-id="{{$guide->id}}" style="font-size:17px">
                                <i class="fa fa-heart" style="color: {{$guide->number_of_likes==1 ? 'FEA107' : '#000'}}"></i>
                            </a>
                        </div>

                        <div class="row mt-4" v-loading="form.loadingDisplay">
                            <div class="col-md-12">
                                <h4>أضف رأيك</h4>
                            </div>
                            <div class="col-md-6 mt-3">
                                <label for="name">الاسم</label>
                                <input class="form-control name" placeholder="الاسم" v-model="name" id="name" value="{{user() ? user()->full_name : null}}">
                                <span v-if="form.validation && form.validation.name" class="error-block">@{{ form.validation.name[0] }}</span>
                            </div>
                            <div class="col-md-6 mt-3">
                                <label for="email">البريد الالكتروني</label>
                                <input class="form-control email" placeholder="البريد الالكتروني" v-model="email" id="email" value="{{user() ? user()->email : null}}">
                                <span v-if="form.validation && form.validation.email" class="error-block">@{{ form.validation.email[0] }}</span>
                            </div>
                            <div class="col-md-12 mt-3">
                                <label for="details">رأيك</label>
                                <textarea class="details form-control" v-model="details" id="details" rows="2" placeholder="رأيك"></textarea>
                                <span v-if="form.validation && form.validation.details" class="error-block">@{{ form.validation.details[0] }}</span>
                            </div>
                            <div class="col-md-12 mt-3 text-center">
                                <button type="button" @click="addComment" :disabled="form.disabledButton" class="addComment btn btn-warning">إرسال</button>
                            </div>
                        </div>

                    </div>
                </div>

                <div class="row mb-4" v-loading="form.loadingDisplayComments">
                    <div class="col-md-12 mb-3">
                        <h4 style="font-weight: bold;">آراء العملاء</h4>
                    </div>

                    <div v-for="comment in  comments" class="comment mb-3 text-justify float-left">
                        <img src="{{user_app_image_default()}}" alt="" class="rounded-circle" width="40" height="40">
                        <h4 style="font-size: 20px; font-weight: bold;">@{{ comment.name }}</h4>
                        <br>
                        <p class="mt-3" style="font-size: 18px;">@{{ comment.details }}</p>
                    </div>

                </div>

                <payment-form-for-purchase
                    :p-order.sync="guide"
                    :currency="`{{$currency}}`"
                    :commissions="{{json_encode($commissions)}}"
                    :key-stripe="`{{$keyStripe}}`">
                </payment-form-for-purchase>
            </div>
        </guide-details-index>

    </div>
@endsection
@push('js')
    <script src="https://js.stripe.com/v2/" defer></script>
@endpush
