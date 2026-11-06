<div class="back-section">
    <div class="container booking-steps" id="divbooking">
        @if(empty($titleBookingStepsSetting))
            <h2 class="title">كيف تحجز خدمة التعليق الصوتي الآن؟</h2>
        @else
            <h2 class="title">{{$titleBookingStepsSetting}}</h2>
        @endif
        @if(!empty($subTitleBookingStepsSetting))
            {{$subTitleBookingStepsSetting}}
        @else
            <h3> إحجز أفضل أصوات المعلقين الصوتيين في 3 خطوات </h3>
        @endif

        <div class="step">
            <div class="row">
                <div class="col-sm-12 col-md-4 col-lg-4">
                    <section class="wow fadeIn animated booking_step_11" data-wow-delay="0.2s">
                        <div class="steps-img">
                            <img class="step" src="{{asset_app('img/step1.png')}}" alt="تعليق صوتي - موقع تعليق صوتي - خدمات تعليق صوتي - فويس اوفر">
                            <img class="step step-hover lazy" data-src="{{asset_app('img/step1-hover.png')}}" src="{{asset_app('img/step1-hover.png')}}" alt="تعليق صوتي - موقع تعليق صوتي - خدمات تعليق صوتي - فويس اوفر" style="display: none;">
                        </div>
                    </section>
                </div>
                <div class="col-sm-12 col-md-4 col-lg-4">
                    <section class="wow fadeIn animated booking_step_20" data-wow-delay="0.5s">
                        <div class="steps-img">
                            <img class="step" src="{{asset_app('img/step2.png')}}" alt="تعليق صوتي - موقع تعليق صوتي - خدمات تعليق صوتي - فويس اوفر">
                            <img class="step step-hover lazy" data-src="{{asset_app('img/step2-hover.png')}}" src="{{asset_app('img/step2-hover.png')}}" alt="تعليق صوتي - موقع تعليق صوتي - خدمات تعليق صوتي - فويس اوفر" style="display: none;">
                        </div>
                    </section>
                </div>
                <div class="col-sm-12 col-md-4 col-lg-4">
                    <section class="wow fadeIn animated booking_step_30" data-wow-delay="0.8s">
                        <div class="steps-img">
                            <img class="step" src="{{asset_app('img/step3.png')}}" alt="تعليق صوتي - موقع تعليق صوتي - خدمات تعليق صوتي - فويس اوفر">
                            <img class="step step-hover lazy" data-src="{{asset_app('img/step3-hover.png')}}" src="{{asset_app('img/step3-hover.png')}}" alt="تعليق صوتي - موقع تعليق صوتي - خدمات تعليق صوتي - فويس اوفر" style="display: none;">
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>
</div>
