<div class="back-section">
    <div class="container our-clients" id="navourclients">
        @if($titleClientsSetting)
            <h2 class="title">{{$titleClientsSetting}}</h2>
        @else
            <h2 class="title">عملاءنا</h2>
        @endif
            @if($subTitleClientsSetting)
                <h3 >{{$subTitleClientsSetting}}</h3>
            @else
                <h3>أكثر من 250 شركة وثقت بخدماتنا الصوتيه ...</h3>
            @endif
        <div class="Clients">
            <div class="owl-carousel owl-theme ourClients">
                @foreach($customers as $customer)
                    <div class="item">
                        <div class="icon-item">
                            <img data-src="{{$customer->image_url}}" src="{{$customer->image_url}}" class="lazy" alt="{{$customer->alt}}">
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </div>
</div>
