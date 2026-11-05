<div class="faq container">
    <h2 class="title" style="    font-weight: bold;">
        الأسئلة الشائعة
    </h2>
    <div class="accordion mt-5" id="accordionExample">
        <div class="row">

            @foreach($faqs as $faq)
            <div class="col-xl-6 col-lg-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapse{{$faq->id}}" aria-expanded="false" aria-controls="collapseOne0">{{$faq->title}}</button>
                        </h5>
                    </div>
                    <div id="collapse{{$faq->id}}" class="collapse" data-parent="#accordionExample">
                        <div class="card-body">{{$faq->details}}</div>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
    </div>
</div>
